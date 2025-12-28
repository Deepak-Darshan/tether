import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { MapPin, Briefcase } from "lucide-react";
import type { User } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SwipeCardProps {
  user: User;
  onSwipe: (direction: "left" | "right") => void;
  isTop?: boolean;
}

export function SwipeCard({ user, onSwipe, isTop = false }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-25, 0, 25]);
  const opacity = useTransform(x, [-300, -100, 0, 100, 300], [0.5, 1, 1, 1, 0.5]);
  
  const leftIndicatorOpacity = useTransform(x, [-150, -50, 0], [1, 0.5, 0]);
  const rightIndicatorOpacity = useTransform(x, [0, 50, 150], [0, 0.5, 1]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      onSwipe("right");
    } else if (info.offset.x < -threshold) {
      onSwipe("left");
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

  return (
    <motion.div
      className="swipe-card"
      style={{ x, rotate, opacity }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      initial={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10 }}
      animate={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10 }}
      exit={{ 
        x: x.get() > 0 ? 300 : -300, 
        opacity: 0,
        transition: { duration: 0.3 }
      }}
      whileDrag={{ cursor: "grabbing" }}
      data-testid={`card-profile-${user.id}`}
    >
      <div className="relative glass-card overflow-hidden" style={{ minHeight: "480px" }}>
        <motion.div
          className="absolute top-4 left-4 z-20 px-4 py-2 rounded-md border-2 border-red-500 text-red-500 font-bold text-xl rotate-[-20deg]"
          style={{ opacity: leftIndicatorOpacity }}
        >
          PASS
        </motion.div>
        
        <motion.div
          className="absolute top-4 right-4 z-20 px-4 py-2 rounded-md border-2 border-cyan-400 text-cyan-400 font-bold text-xl rotate-[20deg] glow-cyan"
          style={{ opacity: rightIndicatorOpacity }}
        >
          CONNECT
        </motion.div>

        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-transparent" />
        
        <div className="relative z-10 p-6 pt-8 flex flex-col h-full">
          <div className="flex items-start gap-4 mb-6">
            <Avatar className="w-24 h-24 border-2 border-cyan-500/30 glow-cyan">
              <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-br from-cyan-500/30 to-purple-500/30 text-xl font-bold text-foreground">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 pt-2">
              <h2 className="text-2xl font-bold text-foreground mb-1" data-testid={`text-name-${user.id}`}>
                {user.name}
              </h2>
              {user.headline && (
                <p className="text-cyan-300 font-medium text-sm flex items-center gap-2" data-testid={`text-headline-${user.id}`}>
                  <Briefcase className="w-4 h-4" strokeWidth={1.5} />
                  {user.headline}
                </p>
              )}
            </div>
          </div>
          
          {user.bio && (
            <div className="mb-6">
              <p className="text-muted-foreground text-sm leading-relaxed" data-testid={`text-bio-${user.id}`}>
                {user.bio}
              </p>
            </div>
          )}
          
          {user.skills && user.skills.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {user.skills.slice(0, 6).map((skill, index) => (
                  <span
                    key={index}
                    className="skill-chip"
                    data-testid={`badge-skill-${skill.toLowerCase().replace(/\s/g, '-')}`}
                  >
                    {skill}
                  </span>
                ))}
                {user.skills.length > 6 && (
                  <span className="skill-chip opacity-70">+{user.skills.length - 6}</span>
                )}
              </div>
            </div>
          )}
          
          {user.lookingFor && user.lookingFor.length > 0 && (
            <div className="mt-auto pt-4 border-t border-white/10">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Looking For</h4>
              <div className="flex flex-wrap gap-2">
                {user.lookingFor.slice(0, 4).map((item, index) => (
                  <span
                    key={index}
                    className="skill-chip-purple"
                    data-testid={`badge-looking-for-${item.toLowerCase().replace(/\s/g, '-')}`}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500" />
      </div>
    </motion.div>
  );
}
