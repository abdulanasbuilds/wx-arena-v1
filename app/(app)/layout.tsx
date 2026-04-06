import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";

export const metadata: Metadata = {
  title: {
    template: "%s | WX ARENA",
    default: "WX ARENA",
  },
  description: "Skill-based competitive gaming",
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#0d0d14] flex flex-col">
      {/* Top navigation bar */}
      <Navbar />

      {/* Main content — pb-20 ensures content clears the fixed MobileNav on mobile */}
      <main className="flex-1 w-full pb-20 md:pb-0">
        {children}
      </main>

      {/* Bottom mobile navigation — fixed, only visible on mobile */}
      <MobileNav />
    </div>
  );
}
