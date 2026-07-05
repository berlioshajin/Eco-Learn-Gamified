import { useGetDashboard } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Leaf, Trophy, Target, Award, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: dashboard, isLoading } = useGetDashboard();

  if (isLoading || !dashboard) {
    return (
      <div className="h-full flex justify-center items-center p-10">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const topicColors: Record<string, string> = {
    climate_change: "bg-red-500",
    waste_management: "bg-amber-600",
    water_conservation: "bg-blue-500",
    energy_saving: "bg-yellow-400",
    biodiversity: "bg-green-500",
  };

  const topicLabels: Record<string, string> = {
    climate_change: "Climate Change",
    waste_management: "Waste Management",
    water_conservation: "Water Conservation",
    energy_saving: "Energy Saving",
    biodiversity: "Biodiversity",
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Welcome back, {user?.name.split(" ")[0]}!</h1>
          <p className="text-muted-foreground mt-1 text-lg">Let's continue saving the planet today.</p>
        </div>
        <Link href="/learn" className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition shadow-sm shadow-primary/20 active:scale-95">
          Resume Learning <ArrowRight className="w-5 h-5" />
        </Link>
      </header>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Leaf className="w-6 h-6 text-primary" />} title="Eco Points" value={dashboard.ecoPoints} color="border-primary" bg="bg-primary/10" />
        <StatCard icon={<Trophy className="w-6 h-6 text-secondary" />} title="Global Rank" value={`#${dashboard.rank}`} color="border-secondary" bg="bg-secondary/10" />
        <StatCard icon={<Target className="w-6 h-6 text-accent-foreground" />} title="Challenges" value={dashboard.completedChallenges} color="border-accent" bg="bg-accent/20" />
        <StatCard icon={<Award className="w-6 h-6 text-purple-500" />} title="Badges" value={dashboard.earnedBadges} color="border-purple-500" bg="bg-purple-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Topic Progress */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold">Your Progress</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dashboard.topicProgress.map((tp) => {
              const pct = tp.totalLessons > 0 ? (tp.completedQuizzes / tp.totalLessons) * 100 : 0;
              return (
                <Card key={tp.topic} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-end mb-4">
                      <div className="font-semibold text-lg">{topicLabels[tp.topic] || tp.topic}</div>
                      <div className="text-sm text-muted-foreground font-medium">{tp.completedQuizzes}/{tp.totalLessons}</div>
                    </div>
                    <Progress value={pct} indicatorColor={topicColors[tp.topic] || "bg-primary"} className="h-3" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Recent Activity</h2>
          <Card className="border-border">
            <CardContent className="p-0">
              {dashboard.recentActivity.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p>No activity yet. Start learning!</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {dashboard.recentActivity.map((activity, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: i * 0.1 }}
                      key={activity.id} 
                      className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          activity.type === 'quiz' ? 'bg-blue-100 text-blue-600' :
                          activity.type === 'challenge' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
                        }`}>
                          {activity.type === 'quiz' ? <Target className="w-4 h-4" /> :
                           activity.type === 'challenge' ? <Leaf className="w-4 h-4" /> : <Award className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{new Date(activity.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="font-bold text-primary text-sm">+{activity.points}</div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color, bg }: { icon: React.ReactNode, title: string, value: string | number, color: string, bg: string }) {
  return (
    <Card className={`border-l-4 ${color} hover:-translate-y-1 transition-transform duration-200`}>
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`p-4 rounded-2xl ${bg}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-extrabold mt-1">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
