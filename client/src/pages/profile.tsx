import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Camera, Plus, X, Save, Loader2, Edit2 } from "lucide-react";
import { BottomNav, TopHeader } from "@/components/bottom-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

interface FloatingInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  testId: string;
}

function FloatingInput({ label, value, onChange, multiline = false, testId }: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const isActive = focused || value.length > 0;
  
  const Component = multiline ? "textarea" : "input";
  
  return (
    <div className="relative">
      <label
        className={`floating-label ${
          isActive ? "floating-label-active" : "floating-label-inactive"
        }`}
      >
        {label}
      </label>
      <Component
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`cyber-input ${multiline ? "min-h-[100px] resize-none" : ""}`}
        data-testid={testId}
      />
    </div>
  );
}

interface SkillChipsProps {
  skills: string[];
  onChange: (skills: string[]) => void;
  label: string;
  color: "cyan" | "purple";
  testIdPrefix: string;
}

function SkillChips({ skills, onChange, label, color, testIdPrefix }: SkillChipsProps) {
  const [newSkill, setNewSkill] = useState("");
  
  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      onChange([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };
  
  const removeSkill = (skill: string) => {
    onChange(skills.filter((s) => s !== skill));
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };
  
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
        {label}
      </label>
      
      <div className="flex flex-wrap gap-2 mb-3">
        {skills.map((skill, index) => (
          <motion.span
            key={skill}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={color === "cyan" ? "skill-chip" : "skill-chip-purple"}
            data-testid={`${testIdPrefix}-${skill.toLowerCase().replace(/\s/g, '-')}`}
          >
            {skill}
            <button
              onClick={() => removeSkill(skill)}
              className="ml-2 hover:text-foreground transition-colors"
              data-testid={`button-remove-${testIdPrefix}-${skill.toLowerCase().replace(/\s/g, '-')}`}
            >
              <X className="w-3 h-3" />
            </button>
          </motion.span>
        ))}
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`Add ${label.toLowerCase()}...`}
          className="cyber-input flex-1 text-sm"
          data-testid={`input-add-${testIdPrefix}`}
        />
        <Button
          size="icon"
          onClick={addSkill}
          disabled={!newSkill.trim()}
          className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30"
          data-testid={`button-add-${testIdPrefix}`}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function Profile() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/users/me"],
  });
  
  const [formData, setFormData] = useState({
    name: "",
    headline: "",
    bio: "",
    skills: [] as string[],
    lookingFor: [] as string[],
    avatarUrl: "",
  });
  
  useState(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        headline: user.headline || "",
        bio: user.bio || "",
        skills: user.skills || [],
        lookingFor: user.lookingFor || [],
        avatarUrl: user.avatarUrl || "",
      });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("PATCH", "/api/users/me", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  
  const handleStartEdit = () => {
    if (user) {
      setFormData({
        name: user.name || "",
        headline: user.headline || "",
        bio: user.bio || "",
        skills: user.skills || [],
        lookingFor: user.lookingFor || [],
        avatarUrl: user.avatarUrl || "",
      });
    }
    setIsEditing(true);
  };
  
  const handleSave = () => {
    updateMutation.mutate(formData);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background mesh-gradient">
        <TopHeader title="Profile" showLogo={false} />
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center">
            <Skeleton className="w-28 h-28 rounded-full" />
            <Skeleton className="h-6 w-40 mt-4" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <BottomNav />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-background mesh-gradient flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to view your profile</p>
        <BottomNav />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background mesh-gradient">
      <TopHeader title="Profile" showLogo={false} />
      
      <main className="pb-24 px-4 pt-6">
        <div className="max-w-md mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div className="relative">
              <Avatar className="w-28 h-28 border-2 border-cyan-500/30 glow-cyan">
                <AvatarImage src={isEditing ? formData.avatarUrl : user.avatarUrl || undefined} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-cyan-500/30 to-purple-500/30 text-2xl font-bold">
                  {getInitials(isEditing ? formData.name : user.name)}
                </AvatarFallback>
              </Avatar>
              
              {isEditing && (
                <button 
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-cyan-500 text-slate-950 glow-cyan"
                  data-testid="button-change-avatar"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {!isEditing && (
              <>
                <h2 className="text-2xl font-bold text-foreground mt-4" data-testid="text-profile-name">
                  {user.name}
                </h2>
                {user.headline && (
                  <p className="text-cyan-400 mt-1" data-testid="text-profile-headline">{user.headline}</p>
                )}
              </>
            )}
          </motion.div>
          
          {!isEditing ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">About</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleStartEdit}
                    className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                    data-testid="button-edit-profile"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
                
                {user.bio ? (
                  <p className="text-muted-foreground text-sm leading-relaxed" data-testid="text-profile-bio">
                    {user.bio}
                  </p>
                ) : (
                  <p className="text-muted-foreground text-sm italic">No bio added yet</p>
                )}
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-5"
              >
                <h3 className="font-semibold text-foreground mb-4">Skills</h3>
                {user.skills && user.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill) => (
                      <span key={skill} className="skill-chip" data-testid={`badge-profile-skill-${skill.toLowerCase().replace(/\s/g, '-')}`}>
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm italic">No skills added yet</p>
                )}
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-5"
              >
                <h3 className="font-semibold text-foreground mb-4">Looking For</h3>
                {user.lookingFor && user.lookingFor.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.lookingFor.map((item) => (
                      <span key={item} className="skill-chip-purple" data-testid={`badge-profile-looking-${item.toLowerCase().replace(/\s/g, '-')}`}>
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm italic">No preferences added yet</p>
                )}
              </motion.div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div className="glass-card p-5 space-y-5">
                <FloatingInput
                  label="Name"
                  value={formData.name}
                  onChange={(name) => setFormData({ ...formData, name })}
                  testId="input-name"
                />
                
                <FloatingInput
                  label="Headline"
                  value={formData.headline}
                  onChange={(headline) => setFormData({ ...formData, headline })}
                  testId="input-headline"
                />
                
                <FloatingInput
                  label="Bio"
                  value={formData.bio}
                  onChange={(bio) => setFormData({ ...formData, bio })}
                  multiline
                  testId="input-bio"
                />
                
                <FloatingInput
                  label="Avatar URL"
                  value={formData.avatarUrl}
                  onChange={(avatarUrl) => setFormData({ ...formData, avatarUrl })}
                  testId="input-avatar-url"
                />
              </div>
              
              <div className="glass-card p-5">
                <SkillChips
                  skills={formData.skills}
                  onChange={(skills) => setFormData({ ...formData, skills })}
                  label="Skills"
                  color="cyan"
                  testIdPrefix="skill"
                />
              </div>
              
              <div className="glass-card p-5">
                <SkillChips
                  skills={formData.lookingFor}
                  onChange={(lookingFor) => setFormData({ ...formData, lookingFor })}
                  label="Looking For"
                  color="purple"
                  testIdPrefix="looking-for"
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-white/20 hover:bg-white/5"
                  onClick={() => setIsEditing(false)}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 glow-cyan"
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  data-testid="button-save-profile"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
