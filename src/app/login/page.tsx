import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { IoArrowBack } from "react-icons/io5";
import { GoogleSignIn } from "@/components/auth/google-sign-in";

export default function LoginPage() {
  return (
    <main
      className="min-h-screen bg-gradient-to-br from-indigo-100/50 via-background to-purple-100/50 
      dark:from-indigo-950/50 dark:via-background dark:to-purple-950/50"
    >
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br 
          from-primary/5 to-transparent rounded-full blur-3xl"
        />
        <div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl 
          from-primary/5 to-transparent rounded-full blur-3xl"
        />
      </div>

      {/* Back Button */}
      <div className="absolute top-4 left-4">
        <Button variant="ghost" size="sm" className="gap-2" asChild>
          <Link href="/">
            <IoArrowBack className="w-4 h-4" />
            Back
          </Link>
        </Button>
      </div>

      {/* Login Card */}
      <div className="container relative flex items-center justify-center min-h-screen max-w-lg mx-auto px-4">
        <Card className="w-full bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <GoogleSignIn />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  By continuing, you agree to our{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
