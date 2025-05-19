"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/";
  const error = searchParams?.get("error");

  const handleSignIn = async () => {
    setIsLoading(true);
    await signIn("osu", { callbackUrl });
  };

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-pink-600 flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">o!</span>
          </div>
          <CardTitle className="mt-4 text-2xl">Connect with osu!</CardTitle>
          <CardDescription>Link your osu! account to see your scores and stats</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md mb-4">
              <p className="text-red-600 dark:text-red-400 text-sm">
                {error === "OAuthSignin" && "Error starting the sign in process. Please try again."}
                {error === "OAuthCallback" && "Error processing the callback from osu!."}
                {error === "OAuthCreateAccount" && "Error creating your account, please try again."}
                {error === "Callback" && "Error processing your authentication callback."}
                {error === "AccessDenied" && "You have denied access to your osu! account."}
                {error === "RefreshAccessTokenError" && "Failed to refresh your authentication token."}
                {error === "invalid_client" && "Invalid osu! client credentials. Please check configuration."}
                {error === "Configuration" && "Server configuration error. Please contact the site administrator."}
                {!["OAuthSignin", "OAuthCallback", "OAuthCreateAccount", "Callback", "AccessDenied", "RefreshAccessTokenError", "invalid_client", "Configuration"].includes(error) && 
                  "An unknown error occurred. Please try again."}
              </p>
            </div>
          )}

          <div className="flex flex-col space-y-4">
            <Button
              onClick={handleSignIn}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 h-11 bg-pink-600 hover:bg-pink-700 rounded-lg"
            >
              <div className="h-5 w-5 rounded-full bg-white flex items-center justify-center">
                <span className="text-pink-600 font-bold text-xs">o!</span>
              </div>
              <span>{isLoading ? "Connecting..." : "Connect with osu!"}</span>
            </Button>

            <div className="text-center">
              <Link 
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-8 text-sm text-muted-foreground max-w-md text-center">
        <p>
          By connecting your osu! account, you'll be able to see your personal scores and stats.
          We only request basic profile info and scores - we never see your password.
        </p>
      </div>
    </div>
  );
} 