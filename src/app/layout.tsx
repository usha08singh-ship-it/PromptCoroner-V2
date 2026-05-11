import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PromptCoroner — AI Prompt Forensics",
  description: "Find out exactly why your AI prompt is failing and get a rewritten version that works.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark bg-background text-on-background">
      <body className="bg-background text-on-background min-h-screen overflow-x-hidden antialiased selection:bg-primary/30 selection:text-primary-fixed">
        {children}
      </body>
    </html>
  );
}
