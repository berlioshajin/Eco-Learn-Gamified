import { useGetLeaderboard, useGetMe } from "@workspace/api-client-react";
import { Loader2, Trophy, Medal, Award, Leaf } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useGetLeaderboard({ limit: 20 });
  const { data: me } = useGetMe();

  if (isLoading) return <div className="h-full flex justify-center items-center p-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      <header className="text-center mb-12">
        <div className="inline-block p-4 rounded-full bg-yellow-400/20 text-yellow-600 mb-4">
          <Trophy className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">Global Leaderboard</h1>
        <p className="text-lg text-muted-foreground mt-2">Top students making the biggest impact.</p>
      </header>

      <Card className="overflow-hidden border-border shadow-md">
        <div className="bg-card">
          {/* Header Row */}
          <div className="grid grid-cols-[auto_1fr_auto] gap-4 p-4 border-b border-border bg-muted/50 font-bold text-muted-foreground text-sm uppercase tracking-wider">
            <div className="w-12 text-center">Rank</div>
            <div>Student</div>
            <div className="text-right px-4">Score</div>
          </div>

          <div className="divide-y divide-border">
            {leaderboard?.map((entry, i) => {
              const isCurrentUser = me?.id === entry.studentId;
              let RankIcon = null;
              if (entry.rank === 1) RankIcon = <Medal className="w-6 h-6 text-yellow-500 fill-yellow-500" />;
              else if (entry.rank === 2) RankIcon = <Medal className="w-6 h-6 text-gray-400 fill-gray-400" />;
              else if (entry.rank === 3) RankIcon = <Medal className="w-6 h-6 text-amber-700 fill-amber-700" />;

              return (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={entry.studentId}
                  className={`grid grid-cols-[auto_1fr_auto] gap-4 p-4 items-center transition-colors ${
                    isCurrentUser ? "bg-primary/10 hover:bg-primary/15" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="w-12 flex justify-center items-center font-bold text-xl text-muted-foreground">
                    {RankIcon || entry.rank}
                  </div>
                  
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-12 h-12 rounded-full bg-background border-2 border-border flex items-center justify-center font-bold text-primary shadow-sm flex-shrink-0">
                      {entry.avatarUrl ? (
                        <img src={entry.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : entry.name.charAt(0)}
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-lg text-foreground flex items-center gap-2 truncate">
                        {entry.name}
                        {isCurrentUser && <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full uppercase tracking-widest shrink-0">You</span>}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">{entry.school} • {entry.badgeCount} Badges</div>
                    </div>
                  </div>

                  <div className="text-right px-4">
                    <div className="font-extrabold text-xl flex items-center justify-end gap-1 text-primary">
                      {entry.ecoPoints}
                    </div>
                    <div className="text-xs text-muted-foreground font-semibold uppercase">Points</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}
