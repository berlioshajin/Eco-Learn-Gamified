import { useListBadges, useGetMyBadges } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Lock, Award, Leaf } from "lucide-react";
import { motion } from "framer-motion";

export default function Badges() {
  const { data: allBadges, isLoading: loadingAll } = useListBadges();
  const { data: myBadges, isLoading: loadingMine } = useGetMyBadges();

  if (loadingAll || loadingMine) return <div className="h-full flex justify-center items-center p-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

  const earnedIds = new Set(myBadges?.map(b => b.id));

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 flex items-center gap-3">
          <Award className="w-10 h-10 text-purple-500" /> Badge Gallery
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Unlock exclusive badges by earning eco-points. Show off your dedication to the planet.
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {allBadges?.map((badge, i) => {
          const isEarned = earnedIds.has(badge.id);
          const earnedBadge = myBadges?.find(b => b.id === badge.id);

          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              key={badge.id}
            >
              <Card className={`h-full text-center transition-all duration-300 border-2 ${
                isEarned 
                  ? "border-primary/30 bg-primary/5 hover:border-primary shadow-sm hover:-translate-y-1" 
                  : "border-border bg-muted/30 opacity-70 grayscale-[0.5]"
              }`}>
                <CardContent className="p-6 flex flex-col items-center justify-between h-full">
                  <div className="relative mb-6">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-inner border-4 ${
                      isEarned ? "bg-background border-primary/20" : "bg-muted border-border"
                    }`}>
                      {/* Using text icon from backend */}
                      <span>{badge.icon}</span>
                    </div>
                    {!isEarned && (
                      <div className="absolute inset-0 bg-background/50 rounded-full flex items-center justify-center backdrop-blur-[2px]">
                        <Lock className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg mb-2 leading-tight ${isEarned ? "text-foreground" : "text-muted-foreground"}`}>
                      {badge.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-3">
                      {badge.description}
                    </p>
                  </div>

                  {isEarned ? (
                    <div className="mt-auto pt-4 border-t border-border/50 w-full">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
                        Earned {new Date(earnedBadge?.earnedAt || "").toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-auto pt-4 border-t border-border/50 w-full">
                      <p className="text-xs font-bold text-muted-foreground flex items-center justify-center gap-1">
                        <Leaf className="w-3 h-3" /> Requires {badge.pointsRequired} pts
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
