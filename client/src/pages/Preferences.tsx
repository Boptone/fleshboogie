import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function Preferences() {
  const [email, setEmail] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState<'daily' | 'weekly'>('daily');

  const { data: preferences, isLoading, refetch } = trpc.newsletter.getPreferences.useQuery(
    { email },
    { enabled: showPreferences }
  );

  const updateFrequency = trpc.newsletter.updateFrequency.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    setShowPreferences(true);
  };

  const handleUpdate = () => {
    updateFrequency.mutate({
      email,
      frequency: selectedFrequency,
    });
  };

  // Set initial frequency when preferences load
  if (preferences && !showPreferences) {
    setSelectedFrequency(preferences.frequency);
    setShowPreferences(true);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b-4 border-black py-8">
        <div className="container">
          <a href="/" className="inline-block">
            <h1 className="text-6xl font-black tracking-tight">FLESHBOOGIE</h1>
            <p className="text-sm uppercase tracking-[0.2em] mt-2 text-gray-600">
              Music • Culture • News • Whatever
            </p>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-16">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-black">Newsletter Preferences</CardTitle>
              <CardDescription className="text-base">
                Manage your subscription to The Boogie Blast
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!showPreferences ? (
                <form onSubmit={handleLookup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Look Up My Preferences
                  </Button>
                </form>
              ) : isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Loading your preferences...</p>
                </div>
              ) : preferences ? (
                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Subscribed email</p>
                    <p className="font-semibold">{preferences.email}</p>
                  </div>

                  <div className="space-y-4">
                    <Label>Newsletter Frequency</Label>
                    <RadioGroup
                      value={selectedFrequency}
                      onValueChange={(value) => setSelectedFrequency(value as 'daily' | 'weekly')}
                    >
                      <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <RadioGroupItem value="daily" id="daily" />
                        <Label htmlFor="daily" className="cursor-pointer flex-1">
                          <div className="font-semibold">Daily</div>
                          <div className="text-sm text-gray-600">
                            Receive The Boogie Blast every morning at 6 AM PST
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <RadioGroupItem value="weekly" id="weekly" />
                        <Label htmlFor="weekly" className="cursor-pointer flex-1">
                          <div className="font-semibold">Weekly</div>
                          <div className="text-sm text-gray-600">
                            Receive a weekly digest every Sunday morning
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleUpdate}
                      disabled={updateFrequency.isPending || selectedFrequency === preferences.frequency}
                      className="flex-1"
                    >
                      {updateFrequency.isPending ? 'Updating...' : 'Save Preferences'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowPreferences(false);
                        setEmail('');
                      }}
                    >
                      Change Email
                    </Button>
                  </div>

                  <div className="pt-6 border-t">
                    <p className="text-sm text-gray-600 mb-2">
                      Want to unsubscribe? Click the unsubscribe link in any newsletter email.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-red-600">Email not found in our subscriber list.</p>
                  <Button
                    variant="outline"
                    onClick={() => setShowPreferences(false)}
                    className="mt-4"
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-black py-8 mt-16">
        <div className="container text-center">
          <p className="text-sm text-gray-600">
            <a href="/" className="hover:underline">
              Back to FLESHBOOGIE
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
