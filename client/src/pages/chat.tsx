import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useRoute, useLocation, Link } from "wouter";
import { ArrowLeft, Send, Loader2, Terminal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { MatchWithUsers, MessageWithSender, User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function Chat() {
  const [, params] = useRoute("/chat/:matchId");
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const matchId = params?.matchId;

  const { data: currentUser } = useQuery<User>({
    queryKey: ["/api/users/me"],
  });

  const { data: match, isLoading: matchLoading } = useQuery<MatchWithUsers>({
    queryKey: ["/api/matches", matchId],
    enabled: !!matchId,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<MessageWithSender[]>({
    queryKey: ["/api/messages", matchId],
    enabled: !!matchId,
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/messages`, { matchId, content });
      return response.json();
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages", matchId] });
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (message.trim() && !sendMutation.isPending) {
      sendMutation.mutate(message.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const otherUser = match && currentUser
    ? (match.user1.id === currentUser.id ? match.user2 : match.user1)
    : null;

  if (matchLoading) {
    return (
      <div className="min-h-screen bg-background mesh-gradient flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!match || !otherUser) {
    return (
      <div className="min-h-screen bg-background mesh-gradient flex flex-col items-center justify-center p-6">
        <p className="text-muted-foreground mb-4">Match not found</p>
        <Button onClick={() => setLocation("/matches")} variant="outline">
          Back to Matches
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background mesh-gradient flex flex-col">
      <header className="sticky top-0 z-30 glass border-b border-white/10">
        <div className="flex items-center gap-3 h-16 px-4">
          <Link href="/matches">
            <button 
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
            </button>
          </Link>
          
          <Avatar className="w-10 h-10 border border-cyan-500/30">
            <AvatarImage src={otherUser.avatarUrl || undefined} alt={otherUser.name} />
            <AvatarFallback className="bg-gradient-to-br from-cyan-500/30 to-purple-500/30 text-sm font-semibold">
              {getInitials(otherUser.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-foreground truncate" data-testid="text-chat-name">
              {otherUser.name}
            </h2>
            {otherUser.headline && (
              <p className="text-xs text-muted-foreground truncate">
                {otherUser.headline}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-1 text-xs text-cyan-400">
            <Terminal className="w-4 h-4" strokeWidth={1.5} />
            <span>SECURE</span>
          </div>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 scrollbar-cyber">
        {messagesLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                <Skeleton className="h-12 w-48 rounded-lg" />
              </div>
            ))}
          </div>
        ) : messages.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => {
                const isOwn = msg.senderId === currentUser?.id;
                
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-lg ${
                        isOwn
                          ? "bg-cyan-500/20 border border-cyan-500/30 text-foreground"
                          : "glass-card text-foreground"
                      }`}
                      data-testid={`message-${msg.id}`}
                    >
                      <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                      <p className={`text-xs mt-1 ${isOwn ? "text-cyan-400/70" : "text-muted-foreground"}`}>
                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full text-center py-20"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-500/20 mb-4">
              <Terminal className="w-8 h-8 text-cyan-400" strokeWidth={1.5} />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Start the Conversation</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              You matched with {otherUser.name}. Send a message to begin connecting!
            </p>
          </motion.div>
        )}
      </main>
      
      <footer className="sticky bottom-0 glass border-t border-white/10 p-4">
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="cyber-input pr-12 font-mono text-sm"
              disabled={sendMutation.isPending}
              data-testid="input-message"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-cyan-500/50 font-mono">
              &gt;_
            </span>
          </div>
          
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sendMutation.isPending}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 h-[46px] w-[46px] p-0 glow-cyan"
            data-testid="button-send"
          >
            {sendMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}
