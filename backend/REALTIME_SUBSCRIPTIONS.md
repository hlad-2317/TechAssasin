# Supabase Real-time Subscriptions Guide

## Overview

The TechAssassin backend has real-time capabilities enabled on key tables to provide live updates to clients. This document explains how to set up and use real-time subscriptions in your frontend application.

## Enabled Tables

Real-time replication is enabled on the following tables:
- `events` - Event updates and creation
- `registrations` - Registration changes for participant count tracking
- `announcements` - New announcements for live feed
- `leaderboard` - Score updates for live leaderboard

## Prerequisites

Make sure you have the Supabase client configured in your frontend:

```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()
```

## Subscription Patterns

### 1. Subscribe to Registration Changes for Participant Count Updates

Use this pattern to update participant counts in real-time when users register for events.

```typescript
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

function EventParticipantCount({ eventId }: { eventId: string }) {
  const [participantCount, setParticipantCount] = useState(0)
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Fetch initial count
    const fetchCount = async () => {
      const { count } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'confirmed')
      
      setParticipantCount(count || 0)
    }
    
    fetchCount()

    // Subscribe to registration changes for this event
    const channel = supabase
      .channel(`event-${eventId}-registrations`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'registrations',
          filter: `event_id=eq.${eventId}`
        },
        (payload) => {
          console.log('Registration change:', payload)
          // Refetch count when registrations change
          fetchCount()
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId, supabase])

  return <div>Participants: {participantCount}</div>
}
```

### 2. Subscribe to Announcement Inserts for Live Feed

Use this pattern to display new announcements in real-time without requiring page refresh.

```typescript
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Announcement {
  id: string
  content: string
  created_at: string
  author_id: string
  author?: {
    username: string
    avatar_url: string | null
  }
}

function AnnouncementFeed() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Fetch initial announcements
    const fetchAnnouncements = async () => {
      const { data } = await supabase
        .from('announcements')
        .select(`
          *,
          author:profiles(username, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (data) setAnnouncements(data)
    }
    
    fetchAnnouncements()

    // Subscribe to new announcements
    const channel = supabase
      .channel('announcements-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT', // Only listen to new announcements
          schema: 'public',
          table: 'announcements'
        },
        async (payload) => {
          console.log('New announcement:', payload)
          
          // Fetch the new announcement with author info
          const { data: newAnnouncement } = await supabase
            .from('announcements')
            .select(`
              *,
              author:profiles(username, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single()
          
          if (newAnnouncement) {
            // Add to top of list
            setAnnouncements(prev => [newAnnouncement, ...prev])
          }
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <div>
      {announcements.map(announcement => (
        <div key={announcement.id}>
          <p>{announcement.author?.username}: {announcement.content}</p>
          <small>{new Date(announcement.created_at).toLocaleString()}</small>
        </div>
      ))}
    </div>
  )
}
```

### 3. Subscribe to Leaderboard Updates for Live Scores

Use this pattern to show real-time leaderboard updates during ongoing events.

```typescript
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface LeaderboardEntry {
  id: string
  event_id: string
  user_id: string
  score: number
  rank: number
  updated_at: string
  user?: {
    username: string
    avatar_url: string | null
  }
}

function LiveLeaderboard({ eventId }: { eventId: string }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Fetch initial leaderboard
    const fetchLeaderboard = async () => {
      const { data } = await supabase
        .from('leaderboard')
        .select(`
          *,
          user:profiles(username, avatar_url)
        `)
        .eq('event_id', eventId)
        .order('rank', { ascending: true })
      
      if (data) setEntries(data)
    }
    
    fetchLeaderboard()

    // Subscribe to leaderboard changes for this event
    const channel = supabase
      .channel(`event-${eventId}-leaderboard`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'leaderboard',
          filter: `event_id=eq.${eventId}`
        },
        (payload) => {
          console.log('Leaderboard update:', payload)
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            // Refetch entire leaderboard to ensure ranks are correct
            fetchLeaderboard()
          } else if (payload.eventType === 'DELETE') {
            // Remove deleted entry
            setEntries(prev => prev.filter(e => e.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId, supabase])

  return (
    <div>
      <h2>Live Leaderboard</h2>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Participant</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(entry => (
            <tr key={entry.id}>
              <td>{entry.rank}</td>
              <td>{entry.user?.username}</td>
              <td>{entry.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

### 4. Subscribe to Event Updates

Use this pattern to show real-time updates when event details change (e.g., registration status).

```typescript
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Event {
  id: string
  title: string
  registration_open: boolean
  max_participants: number
  // ... other fields
}

function EventDetails({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<Event | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Fetch initial event
    const fetchEvent = async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()
      
      if (data) setEvent(data)
    }
    
    fetchEvent()

    // Subscribe to event updates
    const channel = supabase
      .channel(`event-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'events',
          filter: `id=eq.${eventId}`
        },
        (payload) => {
          console.log('Event updated:', payload)
          setEvent(payload.new as Event)
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId, supabase])

  if (!event) return <div>Loading...</div>

  return (
    <div>
      <h1>{event.title}</h1>
      <p>Registration: {event.registration_open ? 'Open' : 'Closed'}</p>
      <p>Max Participants: {event.max_participants}</p>
    </div>
  )
}
```

## Advanced Patterns

### Multiple Subscriptions in One Channel

You can listen to multiple tables in a single channel:

```typescript
const channel = supabase
  .channel('event-updates')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'events' },
    handleEventChange
  )
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'registrations' },
    handleRegistrationChange
  )
  .subscribe()
```

### Presence Tracking

Track which users are currently viewing a page:

```typescript
const channel = supabase.channel('online-users', {
  config: {
    presence: {
      key: userId,
    },
  },
})

channel
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState()
    console.log('Online users:', Object.keys(state))
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({ user_id: userId, online_at: new Date().toISOString() })
    }
  })
```

### Broadcast Messages

Send messages between clients without database persistence:

```typescript
// Sender
channel.send({
  type: 'broadcast',
  event: 'cursor-pos',
  payload: { x: 100, y: 200 },
})

// Receiver
channel.on('broadcast', { event: 'cursor-pos' }, (payload) => {
  console.log('Cursor position:', payload)
})
```

## Connection Management

### Handling Connection States

```typescript
const channel = supabase
  .channel('my-channel')
  .on('postgres_changes', { /* ... */ }, handler)
  .subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log('Connected to real-time')
    } else if (status === 'CHANNEL_ERROR') {
      console.error('Real-time connection error')
    } else if (status === 'TIMED_OUT') {
      console.error('Real-time connection timed out')
    } else if (status === 'CLOSED') {
      console.log('Real-time connection closed')
    }
  })
```

### Reconnection

Supabase client automatically handles reconnection. You can listen to reconnection events:

```typescript
supabase.realtime.onOpen(() => {
  console.log('Real-time connection opened')
})

supabase.realtime.onClose(() => {
  console.log('Real-time connection closed')
})

supabase.realtime.onError((error) => {
  console.error('Real-time error:', error)
})
```

## Performance Considerations

### 1. Filter at the Database Level

Always use filters to reduce the amount of data sent over the wire:

```typescript
// Good - only receives changes for specific event
.on('postgres_changes', {
  event: '*',
  schema: 'public',
  table: 'registrations',
  filter: `event_id=eq.${eventId}`
}, handler)

// Bad - receives all registration changes
.on('postgres_changes', {
  event: '*',
  schema: 'public',
  table: 'registrations'
}, handler)
```

### 2. Unsubscribe When Not Needed

Always clean up subscriptions when components unmount:

```typescript
useEffect(() => {
  const channel = supabase.channel('my-channel')
  // ... setup subscription
  
  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

### 3. Debounce Rapid Updates

If you expect many rapid updates, debounce your UI updates:

```typescript
import { debounce } from 'lodash'

const debouncedUpdate = debounce((payload) => {
  // Update UI
}, 500)

channel.on('postgres_changes', { /* ... */ }, debouncedUpdate)
```

### 4. Batch Refetches

Instead of refetching on every change, batch refetches:

```typescript
let refetchScheduled = false

const scheduleRefetch = () => {
  if (!refetchScheduled) {
    refetchScheduled = true
    setTimeout(() => {
      fetchData()
      refetchScheduled = false
    }, 1000)
  }
}

channel.on('postgres_changes', { /* ... */ }, scheduleRefetch)
```

## Security Considerations

### Row Level Security (RLS)

Real-time subscriptions respect RLS policies. Users will only receive updates for rows they have permission to read.

```sql
-- Example: Users only see their own registrations
CREATE POLICY "Users can view own registrations"
  ON registrations FOR SELECT
  USING (auth.uid() = user_id);
```

### Authentication

Ensure users are authenticated before subscribing to protected channels:

```typescript
const { data: { session } } = await supabase.auth.getSession()

if (!session) {
  console.error('User must be authenticated')
  return
}

// Now safe to subscribe
const channel = supabase.channel('protected-channel')
```

## Troubleshooting

### Subscription Not Receiving Updates

1. **Check if real-time is enabled**: Verify the table is added to the `supabase_realtime` publication
2. **Check RLS policies**: Ensure the user has SELECT permission on the table
3. **Check filters**: Verify the filter syntax is correct
4. **Check connection status**: Log the subscription status callback

### High Latency

1. **Use filters**: Reduce data volume with specific filters
2. **Check network**: Verify WebSocket connection is stable
3. **Optimize queries**: Ensure database queries are fast
4. **Consider debouncing**: Reduce UI update frequency

### Memory Leaks

1. **Always unsubscribe**: Clean up channels in useEffect cleanup
2. **Avoid creating multiple channels**: Reuse channels when possible
3. **Monitor channel count**: Check `supabase.getChannels()` length

## Testing Real-time Features

### Local Development

Use Supabase local development for testing:

```bash
npx supabase start
```

### Manual Testing

1. Open two browser windows
2. Perform an action in one window (e.g., create announcement)
3. Verify the update appears in the other window

### Automated Testing

Mock the Supabase real-time client in tests:

```typescript
const mockChannel = {
  on: jest.fn().mockReturnThis(),
  subscribe: jest.fn(),
}

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => ({
    channel: jest.fn(() => mockChannel),
  }),
}))
```

## Resources

- [Supabase Real-time Documentation](https://supabase.com/docs/guides/realtime)
- [Supabase Real-time API Reference](https://supabase.com/docs/reference/javascript/subscribe)
- [Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes)
- [Presence](https://supabase.com/docs/guides/realtime/presence)
- [Broadcast](https://supabase.com/docs/guides/realtime/broadcast)
