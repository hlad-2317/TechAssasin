import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, profileService } from '@/services';
import { ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, LogOut, User } from 'lucide-react';
import type { Profile } from '@/types/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      navigate('/signin');
      return;
    }

    // Fetch user profile
    const fetchProfile = async () => {
      try {
        const data = await profileService.getMyProfile();
        setProfile(data);
      } catch (error) {
        if (error instanceof ApiError) {
          if (error.status === 401) {
            // Token expired or invalid
            authService.signOut();
            navigate('/signin');
          } else {
            toast({
              title: 'Error',
              description: 'Failed to load profile',
              variant: 'destructive',
            });
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully',
      });
      navigate('/signin');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-hero-bg via-hero-bg to-hero-bg">
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <img 
              src="/favicon.ico" 
              alt="TechAssassin" 
              className="w-8 h-8"
            />
            <h1 className="text-3xl font-bold text-hero-foreground">Dashboard</h1>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-card/80 backdrop-blur-lg border-border shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center text-card-foreground">
                <User className="mr-2 h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription className="text-muted-foreground">Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {profile ? (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Username</p>
                    <p className="font-medium text-card-foreground">{profile.username || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium text-card-foreground">{profile.full_name || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Skills</p>
                    <p className="font-medium text-card-foreground">
                      {profile.skills.length > 0 ? profile.skills.join(', ') : 'No skills added'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Account Type</p>
                    <p className="font-medium text-card-foreground">{profile.is_admin ? 'Admin' : 'User'}</p>
                  </div>
                  <div className="pt-4">
                    <Button variant="outline" className="w-full">
                      Edit Profile
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">Failed to load profile</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-lg border-border shadow-2xl">
            <CardHeader>
              <CardTitle className="text-card-foreground">Events</CardTitle>
              <CardDescription className="text-muted-foreground">Browse and register for hackathons</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => navigate('/events')}>
                View Events
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-lg border-border shadow-2xl">
            <CardHeader>
              <CardTitle className="text-card-foreground">My Registrations</CardTitle>
              <CardDescription className="text-muted-foreground">Your event registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                View Registrations
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="bg-card/80 backdrop-blur-lg border-border shadow-2xl">
            <CardHeader>
              <CardTitle className="text-card-foreground">Welcome to TechAssassin! 🎉</CardTitle>
              <CardDescription className="text-muted-foreground">
                Your hackathon community platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You're now signed in and ready to explore hackathon events, register for competitions,
                and connect with the community. Start by browsing available events or completing your profile.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
