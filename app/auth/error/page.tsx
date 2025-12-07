"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, Alert } from "antd";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let errorMessage = "An authentication error occurred";

  switch (error) {
    case "CredentialsSignin":
      errorMessage = "Invalid email or password";
      break;
    case "OAuthSignin":
      errorMessage = "Error connecting with the provider";
      break;
    case "OAuthCallback":
      errorMessage = "Error during OAuth callback";
      break;
    case "OAuthCreateAccount":
      errorMessage = "Error creating OAuth account";
      break;
    case "EmailCreateAccount":
      errorMessage = "Error creating email account";
      break;
    case "Callback":
      errorMessage = "Error during callback";
      break;
    case "OAuthAccountNotLinked":
      errorMessage = "Account already exists with different provider";
      break;
    case "EmailSignin":
      errorMessage = "Error sending verification email";
      break;
    case "SessionRequired":
      errorMessage = "Please sign in to access this page";
      break;
    default:
      if (error) {
        errorMessage = error;
      }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md" style={{ backgroundColor: "#1f2937" }}>
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white">Authentication Error</h1>
        </div>

        <Alert message={errorMessage} type="error" className="mb-4" />

        <div className="text-center mt-6">
          <Link href="/auth/login" className="text-blue-400 hover:text-blue-300">
            Back to Login
          </Link>
        </div>
      </Card>
    </div>
  );
}
