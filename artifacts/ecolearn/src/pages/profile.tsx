import { useGetMe, useGetMyBadges, useGetDashboard } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Award, MapPin, Loader2, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function Profile() {
  const { data: user, isLoading: userLoading } = useGetMe();
  const { data: badges, isLoading: badgesLoading } = useGetMyBadges();
  const { data: dashboard, isLoading: dashLoading } = useGetDashboard();

  if (userLoading || badgesLoading || dashLoading) {
    return (
      <div className="h-full flex justify-center items-center p-10">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !dashboard) return null;

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-primary/10 to-transparent">
        <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-32 h-32 rounded-full bg-primary/20 border-4 border-background shadow-lg flex items-center justify-center flex-shrink-0">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-5xl font-extrabold text-primary">{user.name.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">{user.name}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted-foreground font-medium">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {user.school || "No school specified"}
              </div>
              {user.grade && (
                <Badge variant="outline" className="bg-background">{user.grade}</Badge>
              )}
              {user.createdAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(user.createdAt).getFullYear()}
                </div>
              )}
            </div>
            
            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4">
              <div className="bg-background px-6 py-3 rounded-2xl border shadow-sm">
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Eco Points</div>
                <div className="text-3xl font-extrabold text-primary flex items-center gap-2">
                  <Leaf className="w-6 h-6" /> {user.ecoPoints}
                </div>
              </div>
              <div className="bg-background px-6 py-3 rounded-2xl border shadow-sm">
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Global Rank</div>
                <div className="text-3xl font-extrabold text-secondary">
                  #{dashboard.rank}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earned Badges */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" /> Earned Badges
          </h2>
          <Badge className="text-sm px-3 py-1">{badges?.length || 0} Badges</Badge>
        </div>
        
        {(!badges || badges.length === 0) ? (
          <Card className="border-dashed border-2">
            <CardContent className="p-12 text-center text-muted-foreground">
              <Award className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No badges earned yet.</p>
              <p className="text-sm mt-1">Complete lessons and challenges to unlock rewards!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map((badge, i) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                key={badge.id}
              >
                <Card className="h-full border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                  <CardContent className="p-6 text-center flex flex-col items-center">
                    <div className="text-5xl mb-4 bg-background p-4 rounded-full shadow-sm border border-border/50">
                      {/* Emojis not allowed, using image or icon, since icon is a string like an emoji from backend usually, let's use a generic icon or the text if we can't use emoji */}
                      {/* Assuming icon field might be emoji, we must strip it or render an Award if it is. The prompt says NO EMOJIS anywhere. Let's force a Lucide icon. */}
                      <Award className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="font-bold mb-1">{badge.name}</h3>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                    {badge.earnedAt && (
                      <p className="text-[10px] text-muted-foreground mt-4 font-semibold uppercase tracking-wider">
                        Earned {new Date(badge.earnedAt).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
