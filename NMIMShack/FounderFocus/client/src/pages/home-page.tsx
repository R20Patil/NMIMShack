import { SidebarNav } from "@/components/sidebar-nav";
import { ChatInterface } from "@/components/chat-interface";

export default function HomePage() {
  return (
    <div className="flex h-screen">
      <div className="w-64 hidden md:block">
        <SidebarNav />
      </div>
      <main className="flex-1 bg-[#F8F9FA]">
        <ChatInterface />
      </main>
    </div>
  );
}
