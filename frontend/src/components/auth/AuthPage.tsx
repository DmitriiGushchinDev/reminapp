import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, Users, Bell } from 'lucide-react'
import Index from '@/pages/Index'

const AuthPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <SignedOut>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              AppointmentPro
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Smart appointment booking and reminder management system
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Features Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Smart Scheduling
                  </CardTitle>
                  <CardDescription>
                    Efficient appointment booking with intelligent time management
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Client Management
                  </CardTitle>
                  <CardDescription>
                    Organize and track all your client information in one place
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Multi-Channel Reminders
                  </CardTitle>
                  <CardDescription>
                    Send reminders via email, SMS, and WhatsApp
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Time Templates
                  </CardTitle>
                  <CardDescription>
                    Create reusable appointment templates for different services
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Auth Section */}
            <div className="flex flex-col justify-center">
              <Card>
                <CardHeader>
                  <CardTitle>Get Started</CardTitle>
                  <CardDescription>
                    Sign in to your account or create a new one
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <SignInButton mode="modal" fallbackRedirectUrl="/">
                    <Button className="w-full" size="lg">
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal" fallbackRedirectUrl="/">
                    <Button variant="outline" className="w-full" size="lg">
                      Create Account
                    </Button>
                  </SignUpButton>
                  <p className="text-sm text-muted-foreground text-center">
                    Supports email/password and Facebook login
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <Index />
      </SignedIn>
    </div>
  )
}

export default AuthPage