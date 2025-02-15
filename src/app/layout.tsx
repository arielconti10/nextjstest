import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Zap, History } from "lucide-react";
import Link from "next/link";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

const SIDEBAR_ITEMS = [
  { name: "Conditions", icon: Zap, href: "/" },
  { name: "Audit Logs", icon: History, href: "/audit-logs" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex min-h-screen">
          <SidebarProvider>
            <div className="flex h-full w-full">
              <Sidebar
                collapsible="none"
                className="hidden h-screen border-r bg-sidebar md:flex"
              >
                <SidebarContent className="h-full bg-sidebar">
                  <SidebarGroup className="h-full">
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {SIDEBAR_ITEMS.map((item) => (
                          <SidebarMenuItem key={item.name}>
                            <SidebarMenuButton asChild>
                              <Link
                                href={item.href}
                                className="flex items-center gap-2"
                              >
                                <item.icon className="h-4 w-4" />
                                <span>{item.name}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                </SidebarContent>
              </Sidebar>
              <main className="flex-1 p-4 md:p-6 lg:p-8">
                <div className="mx-auto max-w-[1200px]">{children}</div>
              </main>
            </div>
          </SidebarProvider>
        </div>
      </body>
    </html>
  );
}
