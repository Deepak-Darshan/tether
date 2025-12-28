import { motion, AnimatePresence } from "framer-motion";
import { Zap, MessageSquare, ArrowRight } from "lucide-react";
import type { User } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface MatchOverlayProps {
  isVisible: boolean;
  matchedUser: User | null;
  currentUser: User | null;
  onClose: () => void;
  onStartChat: () => void;
}

export function MatchOverlay({ 
  isVisible, 
  matchedUser, 
  currentUser,
  onClose, 
  onStartChat 
}: MatchOverlayProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AnimatePresence>
      {isVisible && matchedUser && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          onClick={onClose}
          data-testid="overlay-match"
        >
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-lg" />
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="absolute inset-0 overflow-hidden pointer-events-none"
          >
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse-glow" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "0.5s" }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-cyan-500/10 to-transparent rounded-full animate-pulse" />
          </motion.div>
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative z-10 text-center max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
              className="mb-8"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 glow-cyan mb-4">
                <Zap className="w-10 h-10 text-slate-950" strokeWidth={2.5} />
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ letterSpacing: "0.5em", opacity: 0, scale: 0.5 }}
              animate={{ letterSpacing: "0.2em", opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-3xl sm:text-4xl font-bold text-cyan-400 glow-text-cyan mb-4"
              data-testid="text-link-established"
            >
              LINK ESTABLISHED
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="text-muted-foreground mb-8"
            >
              You and {matchedUser.name} are now connected
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="flex items-center justify-center gap-4 mb-10"
            >
              {currentUser && (
                <div className="relative">
                  <Avatar className="w-20 h-20 border-2 border-cyan-500/50 glow-cyan">
                    <AvatarImage src={currentUser.avatarUrl || undefined} alt={currentUser.name} />
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500/30 to-purple-500/30 text-lg font-bold">
                      {getInitials(currentUser.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
              
              <div className="flex flex-col items-center gap-1">
                <div className="w-16 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500" />
                <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
                <div className="w-16 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500" />
              </div>
              
              <div className="relative">
                <Avatar className="w-20 h-20 border-2 border-purple-500/50 glow-purple">
                  <AvatarImage src={matchedUser.avatarUrl || undefined} alt={matchedUser.name} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500/30 to-cyan-500/30 text-lg font-bold">
                    {getInitials(matchedUser.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Button
                onClick={onStartChat}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-6 glow-cyan"
                data-testid="button-send-message"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Message
              </Button>
              
              <Button
                onClick={onClose}
                variant="outline"
                className="border-white/20 hover:bg-white/5"
                data-testid="button-keep-swiping"
              >
                Keep Swiping
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
