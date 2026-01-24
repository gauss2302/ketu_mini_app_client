import { BottomNav } from "../components/bottom-nav";
import React from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <div className="pb-20">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
