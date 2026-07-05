import { useListStudents } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function AdminStudents() {
  const { data: students, isLoading } = useListStudents();

  if (isLoading) return <div className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-8">Registered Students</h1>

      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 p-4 border-b border-border bg-muted/50 font-bold text-sm uppercase tracking-wider text-muted-foreground">
            <div>Name</div>
            <div>Email</div>
            <div>School</div>
            <div className="text-right">Points</div>
          </div>
          <div className="divide-y divide-border">
            {students?.map(student => (
              <div key={student.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 p-4 items-center hover:bg-muted/30">
                <div className="font-semibold">{student.name}</div>
                <div className="text-sm text-muted-foreground">{student.email}</div>
                <div className="text-sm">{student.school} {student.grade ? `(${student.grade})` : ''}</div>
                <div className="text-right font-bold text-primary">{student.ecoPoints}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
