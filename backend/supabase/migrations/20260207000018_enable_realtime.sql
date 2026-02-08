-- Enable real-time replication on tables
-- This allows clients to subscribe to database changes via WebSocket

-- Enable real-time on events table
ALTER PUBLICATION supabase_realtime ADD TABLE events;

-- Enable real-time on registrations table
ALTER PUBLICATION supabase_realtime ADD TABLE registrations;

-- Enable real-time on announcements table
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;

-- Enable real-time on leaderboard table
ALTER PUBLICATION supabase_realtime ADD TABLE leaderboard;
