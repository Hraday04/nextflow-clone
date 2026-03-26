import type { Metadata } from "next";
import { Inter } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  UserButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "NextFlow Clone",
  description: "Advanced AI Workflow Automation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#7c3aed",
          colorBackground: "#0a0a0a",
          colorText: "white",
        },
      }}
    >
      <html lang="en" className="dark h-full w-full">
        <body
          className={`${inter.className} ${inter.variable} antialiased h-full w-full m-0 p-0 overflow-hidden bg-[#0a0a0a]`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
