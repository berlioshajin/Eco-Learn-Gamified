import { useState } from "react";
import { useListQuizzes, useCreateQuiz, useUpdateQuiz, useDeleteQuiz, QuizInputTopic } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Edit2, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListQuizzesQueryKey } from "@workspace/api-client-react";

export default function AdminQuizzes() {
  const { data: quizzes, isLoading } = useListQuizzes();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    topic: "climate_change" as QuizInputTopic,
    description: "",
    pointsPerQuestion: 10
  });

  const createMutation = useCreateQuiz();
  const updateMutation = useUpdateQuiz();
  const deleteMutation = useDeleteQuiz();

  const handleSave = () => {
    if (isEditing) {
      updateMutation.mutate({ id: isEditing, data: formData }, {
        onSuccess: () => {
          setIsEditing(null);
          queryClient.invalidateQueries({ queryKey: getListQuizzesQueryKey() });
        }
      });
    } else {
      createMutation.mutate({ data: formData }, {
        onSuccess: () => {
          setIsCreating(false);
          queryClient.invalidateQueries({ queryKey: getListQuizzesQueryKey() });
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this quiz?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListQuizzesQueryKey() })
      });
    }
  };

  const openEdit = (quiz: any) => {
    setFormData({
      title: quiz.title,
      topic: quiz.topic,
      description: quiz.description || "",
      pointsPerQuestion: quiz.pointsPerQuestion
    });
    setIsEditing(quiz.id);
  };

  if (isLoading) return <div className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold">Manage Quizzes</h1>
        {!isCreating && !isEditing && (
          <Button onClick={() => {
            setFormData({ title: "", topic: "climate_change", description: "", pointsPerQuestion: 10 });
            setIsCreating(true);
          }}><Plus className="w-4 h-4 mr-2"/> Add Quiz</Button>
        )}
      </div>

      {(isCreating || isEditing) && (
        <Card className="mb-8 border-primary">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-bold mb-4">{isEditing ? "Edit Quiz" : "New Quiz"}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Topic</Label>
                <select className="flex h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value as any})}>
                  <option value="climate_change">Climate Change</option>
                  <option value="waste_management">Waste Management</option>
                  <option value="water_conservation">Water Conservation</option>
                  <option value="energy_saving">Energy Saving</option>
                  <option value="biodiversity">Biodiversity</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Points Per Question</Label>
                <Input type="number" value={formData.pointsPerQuestion} onChange={e => setFormData({...formData, pointsPerQuestion: Number(e.target.value)})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <textarea className="flex w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="flex gap-4 pt-4">
              <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>Save Quiz</Button>
              <Button variant="outline" onClick={() => { setIsCreating(false); setIsEditing(null); }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {quizzes?.map(quiz => (
          <Card key={quiz.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">{quiz.title}</h3>
                <div className="text-sm text-muted-foreground">{quiz.topic} • {quiz.questionCount} Questions • {quiz.pointsPerQuestion} pts/q</div>
              </div>
              <div className="flex gap-2">
                {/* Normally we'd have a link to manage questions here, skipping for brevity but let's add a fake button */}
                <Button size="sm" variant="secondary">Questions</Button>
                <Button size="icon" variant="outline" onClick={() => openEdit(quiz)}><Edit2 className="w-4 h-4"/></Button>
                <Button size="icon" variant="destructive" onClick={() => handleDelete(quiz.id)}><Trash2 className="w-4 h-4"/></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
