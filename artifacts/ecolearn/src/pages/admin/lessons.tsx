import { useState } from "react";
import { useListLessons, useCreateLesson, useUpdateLesson, useDeleteLesson, LessonInputTopic, LessonInputDifficulty } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Edit2, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListLessonsQueryKey } from "@workspace/api-client-react";

export default function AdminLessons() {
  const { data: lessons, isLoading } = useListLessons();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    topic: "climate_change" as LessonInputTopic,
    summary: "",
    content: "",
    imageUrl: "",
    difficulty: "beginner" as LessonInputDifficulty
  });

  const createMutation = useCreateLesson();
  const updateMutation = useUpdateLesson();
  const deleteMutation = useDeleteLesson();

  const handleSave = () => {
    if (isEditing) {
      updateMutation.mutate({ id: isEditing, data: formData }, {
        onSuccess: () => {
          setIsEditing(null);
          queryClient.invalidateQueries({ queryKey: getListLessonsQueryKey() });
        }
      });
    } else {
      createMutation.mutate({ data: formData }, {
        onSuccess: () => {
          setIsCreating(false);
          queryClient.invalidateQueries({ queryKey: getListLessonsQueryKey() });
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this lesson?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListLessonsQueryKey() })
      });
    }
  };

  const openEdit = (lesson: any) => {
    setFormData({
      title: lesson.title,
      topic: lesson.topic,
      summary: lesson.summary,
      content: lesson.content,
      imageUrl: lesson.imageUrl,
      difficulty: lesson.difficulty || "beginner"
    });
    setIsEditing(lesson.id);
  };

  if (isLoading) return <div className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold">Manage Lessons</h1>
        {!isCreating && !isEditing && (
          <Button onClick={() => {
            setFormData({ title: "", topic: "climate_change", summary: "", content: "", imageUrl: "", difficulty: "beginner" });
            setIsCreating(true);
          }}><Plus className="w-4 h-4 mr-2"/> Add Lesson</Button>
        )}
      </div>

      {(isCreating || isEditing) && (
        <Card className="mb-8 border-primary">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-bold mb-4">{isEditing ? "Edit Lesson" : "New Lesson"}</h2>
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
                <Label>Difficulty</Label>
                <select className="flex h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value as any})}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Summary</Label>
              <textarea className="flex w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" rows={2} value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Content (HTML)</Label>
              <textarea className="flex w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-mono" rows={10} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
            </div>
            <div className="flex gap-4 pt-4">
              <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>Save Lesson</Button>
              <Button variant="outline" onClick={() => { setIsCreating(false); setIsEditing(null); }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {lessons?.map(lesson => (
          <Card key={lesson.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">{lesson.title}</h3>
                <div className="text-sm text-muted-foreground">{lesson.topic} • {lesson.difficulty}</div>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" onClick={() => openEdit(lesson)}><Edit2 className="w-4 h-4"/></Button>
                <Button size="icon" variant="destructive" onClick={() => handleDelete(lesson.id)}><Trash2 className="w-4 h-4"/></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
