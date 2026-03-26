"use client";

import { ReactFlowProvider } from "reactflow";
import FlowCanvas from "@/components/canvas/FlowCanvas";
import {
  SignInButton,
  UserButton,
  SignedIn,
  SignedOut,
  SignIn,
  RedirectToSignIn,
} from "@clerk/nextjs";

export default function Home() {
  return (
    <ReactFlowProvider>
      <main className="min-h-screen bg-[#18181b]">
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
        <SignedIn>
          
          <FlowCanvas />
        </SignedIn>
      </main>
    </ReactFlowProvider>
  );
}
