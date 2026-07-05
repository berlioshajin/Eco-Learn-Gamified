import { useGetAdminDashboard } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Target, Leaf, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminDashboard();

  if (isLoading || !stats) {
    return <div className="h-full flex justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Admin Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={stats.totalStudents} icon={<Users className="w-6 h-6 text-blue-500" />} />
        <StatCard title="Lessons" value={stats.totalLessons} icon={<BookOpen className="w-6 h-6 text-green-500" />} />
        <StatCard title="Quizzes" value={stats.totalQuizzes} icon={<Target className="w-6 h-6 text-red-500" />} />
        <StatCard title="Challenges" value={stats.totalChallenges} icon={<Leaf className="w-6 h-6 text-amber-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentRegistrations.map(student => (
                <div key={student.id} className="flex justify-between items-center p-3 hover:bg-muted rounded-lg">
                  <div>
                    <div className="font-semibold">{student.name}</div>
                    <div className="text-sm text-muted-foreground">{student.school}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(student.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Students Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topStudents.slice(0, 5).map(student => (
                <div key={student.studentId} className="flex justify-between items-center p-3 hover:bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                      {student.rank}
                    </div>
                    <div>
                      <div className="font-semibold">{student.name}</div>
                      <div className="text-sm text-muted-foreground">{student.badgeCount} Badges</div>
                    </div>
                  </div>
                  <div className="font-bold text-primary">
                    {student.ecoPoints} pts
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center gap-4">
        <div className="p-3 bg-muted rounded-xl">
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-extrabold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
