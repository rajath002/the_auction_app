"use client";

import { signOut } from "next-auth/react";
import { useCallback, useMemo } from "react";

export const SignoutLinkBtn = () => {

  const handleSignOut = useCallback(async () => {
    await signOut({
      callbackUrl: "/auth/sign-in",
    });
  }, []);

  return useMemo(() => (
    <div>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  ), [handleSignOut]);
};
