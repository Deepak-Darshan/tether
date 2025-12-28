import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { MessageSquare, Zap, Clock } from "lucide-react";
import { BottomNav, TopHeader } from "@/components/bottom-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { MatchWithUsers } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function Matches() {
  const { data: matches = [], isLoading } = useQuery<MatchWithUsers[]>({
    queryKey: ["/api/matches"],
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getOtherUser = (match: MatchWithUsers, currentUserId: string) => {
    return match.user1.id === currentUserId ? match.user2 : match.user1;
  };

  const { data: currentUser } = useQuery<{ id: string }>({
    queryKey: ["/api/users/me"],
  });

  return (
    <div className="min-h-screen bg-background mesh-gradient">
      <TopHeader title="Messages" showLogo={false} />
      
      <main className="pb-24">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 glass-card">
                <Skeleton className="w-14 h-14 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : matches.length > 0 ? (
          <div className="p-4 space-y-3">
            {matches.map((match, index) => {
              const otherUser = currentUser ? getOtherUser(match, currentUser.id) : match.user2;
              
              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/chat/${match.id}`}>
                    <div 
                      className="flex items-center gap-4 p-4 glass-card hover:bg-white/10 transition-colors cursor-pointer group"
                      data-testid={`card-match-${match.id}`}
                    >
                      <div className="relative">
                        <Avatar className="w-14 h-14 border-2 border-cyan-500/30 group-hover:border-cyan-500/50 transition-colors">
                          <AvatarImage src={otherUser.avatarUrl || undefined} alt={otherUser.name} />
                          <AvatarFallback className="bg-gradient-to-br from-cyan-500/30 to-purple-500/30 font-semibold">
                            {getInitials(otherUser.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center">
                          <Zap className="w-3 h-3 text-slate-950" strokeWidth={2.5} />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate" data-testid={`text-match-name-${match.id}`}>
                            {otherUser.name}
                          </h3>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(match.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        
                        {match.lastMessage ? (
                          <p className="text-sm text-muted-foreground truncate" data-testid={`text-last-message-${match.id}`}>
                            {match.lastMessage.content}
                          </p>
                        ) : (
                          <p className="text-sm text-cyan-400 flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            New connection! Say hello
                          </p>
                        )}
                        
                        {otherUser.headline && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {otherUser.headline}
                          </p>
                        )}
                      </div>
                      
                      <MessageSquare className="w-5 h-5 text-muted-foreground group-hover:text-cyan-400 transition-colors flex-shrink-0" strokeWidth={1.5} />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-8 mt-20"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-500/20 mb-6">
              <MessageSquare className="w-10 h-10 text-cyan-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2" data-testid="text-no-matches">
              No Matches Yet
            </h3>
            <p className="text-muted-foreground text-center max-w-xs">
              Start swiping to find your next great connection. When you match, you'll see them here.
            </p>
            <Link href="/deck">
              <button className="mt-6 px-6 py-3 bg-cyan-500 text-slate-950 font-semibold rounded-lg glow-cyan" data-testid="button-start-swiping">
                Start Swiping
              </button>
            </Link>
          </motion.div>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
}
