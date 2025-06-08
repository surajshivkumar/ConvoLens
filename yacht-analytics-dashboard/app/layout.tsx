import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { VoiceAssistant } from "@/components/voice-assistant";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Yacht Analytics Dashboard",
  description: "Conversation analytics for yacht brokerage customer service",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <div className="flex min-h-screen bg-slate-950">
              <AppSidebar />
              <div className="flex-1 flex flex-col">
                {/* <Header /> */}
                <main className="flex-1 p-6">{children}</main>
              </div>
            </div>
            <VoiceAssistant />
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
