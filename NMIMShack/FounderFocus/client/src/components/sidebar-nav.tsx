import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { MessageSquare, History, LogOut } from "lucide-react";

export function SidebarNav() {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();

  const links = [
    { href: "/", icon: MessageSquare, label: "AI Chat" },
    { href: "/history", icon: History, label: "Chat History" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#2D46B9] text-white p-4 gap-2">
      <div className="font-bold text-xl mb-6">Solo Founder AI</div>
      <nav className="space-y-2 flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <Button
                variant={location === link.href ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <Icon className="mr-2 h-4 w-4" />
                {link.label}
              </Button>
            </Link>
          );
        })}
      </nav>
      <Button
        variant="ghost"
        className="justify-start"
        onClick={() => logoutMutation.mutate()}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </div>
  );
}
