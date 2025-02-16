import { SidebarNav } from "@/components/sidebar-nav";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ChatHistory } from "@shared/schema";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export default function ChatHistoryPage() {
  const { data: history, isLoading } = useQuery<ChatHistory[]>({
    queryKey: ["/api/chat-history"],
  });

  return (
    <div className="flex h-screen">
      <div className="w-64 hidden md:block">
        <SidebarNav />
      </div>
      <main className="flex-1 bg-[#F8F9FA] p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">Chat History</h1>
        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {history?.map((chat) => (
              <Card key={chat.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium">{chat.message}</p>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(chat.createdAt), "PPp")}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{chat.response}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
