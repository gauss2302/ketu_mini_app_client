import { BottomNav } from "../components/bottom-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <div className="pb-20">
        {" "}
        {/* Added padding for bottom nav */}
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
