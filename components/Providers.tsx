"use client";

import { ProfileProvider } from "@/lib/store";
import AuthGate from "./AuthGate";
import Shell from "./Shell";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      <AuthGate>
        <Shell>{children}</Shell>
      </AuthGate>
    </ProfileProvider>
  );
}
