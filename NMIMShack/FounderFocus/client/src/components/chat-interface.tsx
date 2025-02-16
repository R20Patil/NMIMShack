import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ChatHistory } from "@shared/schema";
import { Send, Loader2, Lightbulb, BarChart2, Heart } from "lucide-react";

export function ChatInterface() {
  const [message, setMessage] = useState("");
  const { user } = useAuth();

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/chat", { message });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat-history"] });
      setMessage("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !chatMutation.isPending) {
      chatMutation.mutate(message);
    }
  };

  const getQueryIcon = (message: string) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('validate') || lowerMessage.includes('idea')) {
      return <Lightbulb className="h-5 w-5" />;
    } else if (lowerMessage.includes('strategy') || lowerMessage.includes('plan')) {
      return <BarChart2 className="h-5 w-5" />;
    }
    return <Heart className="h-5 w-5" />;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {chatMutation.data && (
          <>
            <Card className="ml-auto max-w-[80%] shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {getQueryIcon(chatMutation.data.message)}
                  <div className="text-sm font-medium text-gray-700">
                    {chatMutation.data.message}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="mr-auto max-w-[80%] bg-[#2D46B9] text-white shadow-sm">
              <CardContent className="p-4">
                <div className="text-sm leading-relaxed">
                  {chatMutation.data.response.split('\n').map((line: string, index: number) => {
                    const trimmedLine = line.trim();
                    if (!trimmedLine) return null;

                    // Check if it's a main section header
                    if (trimmedLine.endsWith(':')) {
                      return (
                        <h3 key={index} className="font-bold text-base mt-4 mb-2 border-b border-white/20 pb-1">
                          {trimmedLine}
                        </h3>
                      );
                    }

                    // Regular paragraph with improved spacing
                    return (
                      <p key={index} className="mb-3 last:mb-0 leading-relaxed">
                        {trimmedLine}
                      </p>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="border-t bg-white p-4 shadow-sm">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <Textarea
              placeholder="Ask about idea validation, strategic advice, or get support for your startup journey..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 min-h-[60px] resize-none"
            />
            <Button
              type="submit"
              size="icon"
              className="h-[60px] w-[60px] bg-[#2D46B9] hover:bg-[#1D2F8F]"
              disabled={chatMutation.isPending || !message.trim()}
            >
              {chatMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}