import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, RefreshCw, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { SwipeCard } from "@/components/swipe-card";
import { MatchOverlay } from "@/components/match-overlay";
import { BottomNav, TopHeader } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export default function Deck() {
  const [, setLocation] = useLocation();
  const [showMatch, setShowMatch] = useState(false);
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: currentUser } = useQuery<User>({
    queryKey: ["/api/users/me"],
  });

  const { data: profiles = [], isLoading, refetch } = useQuery<User[]>({
    queryKey: ["/api/profiles"],
  });

  const swipeMutation = useMutation({
    mutationFn: async ({ swipeeId, direction }: { swipeeId: string; direction: "left" | "right" }) => {
      const response = await apiRequest("POST", "/api/swipes", { swipeeId, direction });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.match) {
        setMatchedUser(profiles[currentIndex]);
        setShowMatch(true);
      }
      setCurrentIndex((prev) => prev + 1);
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
    },
  });

  const handleSwipe = useCallback((direction: "left" | "right") => {
    const currentProfile = profiles[currentIndex];
    if (currentProfile) {
      swipeMutation.mutate({ swipeeId: currentProfile.id, direction });
    }
  }, [profiles, currentIndex, swipeMutation]);

  const handleCloseMatch = () => {
    setShowMatch(false);
    setMatchedUser(null);
  };

  const handleStartChat = () => {
    setShowMatch(false);
    setLocation("/matches");
  };

  const visibleProfiles = profiles.slice(currentIndex, currentIndex + 3);
  const hasProfiles = visibleProfiles.length > 0;

  return (
    <div className="min-h-screen bg-background mesh-gradient">
      <TopHeader />
      
      <main className="pt-4 pb-24 px-4">
        <div className="max-w-md mx-auto">
          <div className="relative h-[520px] flex items-center justify-center">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                <p>Loading profiles...</p>
              </div>
            ) : hasProfiles ? (
              <AnimatePresence mode="popLayout">
                {visibleProfiles.map((profile, index) => (
                  <SwipeCard
                    key={profile.id}
                    user={profile}
                    onSwipe={handleSwipe}
                    isTop={index === 0}
                  />
                )).reverse()}
              </AnimatePresence>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-8 text-center max-w-sm"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-500/20">
                  <RefreshCw className="w-8 h-8 text-cyan-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2" data-testid="text-no-profiles">
                  No More Profiles
                </h3>
                <p className="text-muted-foreground mb-6">
                  You've seen everyone! Check back later for new connections.
                </p>
                <Button
                  onClick={() => refetch()}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950"
                  data-testid="button-refresh"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </motion.div>
            )}
          </div>
          
          {hasProfiles && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-6 mt-6"
            >
              <Button
                size="lg"
                variant="outline"
                className="w-16 h-16 rounded-full border-2 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500"
                onClick={() => handleSwipe("left")}
                disabled={swipeMutation.isPending}
                data-testid="button-pass"
              >
                <X className="w-8 h-8" strokeWidth={2} />
              </Button>
              
              <Button
                size="lg"
                className="w-20 h-20 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 glow-cyan"
                onClick={() => handleSwipe("right")}
                disabled={swipeMutation.isPending}
                data-testid="button-connect"
              >
                <Heart className="w-10 h-10" strokeWidth={2} />
              </Button>
            </motion.div>
          )}
        </div>
      </main>
      
      <MatchOverlay
        isVisible={showMatch}
        matchedUser={matchedUser}
        currentUser={currentUser || null}
        onClose={handleCloseMatch}
        onStartChat={handleStartChat}
      />
      
      <BottomNav />
    </div>
  );
}
