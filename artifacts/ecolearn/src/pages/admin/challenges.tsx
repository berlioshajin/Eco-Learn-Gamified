import { useState } from "react";
import { useListChallenges, useCreateChallenge, useUpdateChallenge, useDeleteChallenge } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Edit2, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListChallengesQueryKey } from "@workspace/api-client-react";

export default function AdminChallenges() {
  const { data: challenges, isLoading } = useListChallenges();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon: "🌱",
    ecoPoints: 50,
    isDaily: true
  });

  const createMutation = useCreateChallenge();
  const updateMutation = useUpdateChallenge();
  const deleteMutation = useDeleteChallenge();

  const handleSave = () => {
    if (isEditing) {
      updateMutation.mutate({ id: isEditing, data: formData }, {
        onSuccess: () => {
          setIsEditing(null);
          queryClient.invalidateQueries({ queryKey: getListChallengesQueryKey() });
        }
      });
    } else {
      createMutation.mutate({ data: formData }, {
        onSuccess: () => {
          setIsCreating(false);
          queryClient.invalidateQueries({ queryKey: getListChallengesQueryKey() });
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this challenge?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListChallengesQueryKey() })
      });
    }
  };

  const openEdit = (challenge: any) => {
    setFormData({
      title: challenge.title,
      description: challenge.description,
      icon: challenge.icon,
      ecoPoints: challenge.ecoPoints,
      isDaily: challenge.isDaily
    });
    setIsEditing(challenge.id);
  };

  if (isLoading) return <div className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold">Manage Challenges</h1>
        {!isCreating && !isEditing && (
          <Button onClick={() => {
            setFormData({ title: "", description: "", icon: "TextIcon", ecoPoints: 50, isDaily: true });
            setIsCreating(true);
          }}><Plus className="w-4 h-4 mr-2"/> Add Challenge</Button>
        )}
      </div>

      {(isCreating || isEditing) && (
        <Card className="mb-8 border-primary">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-bold mb-4">{isEditing ? "Edit Challenge" : "New Challenge"}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Icon (Text)</Label>
                <Input value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Points</Label>
                <Input type="number" value={formData.ecoPoints} onChange={e => setFormData({...formData, ecoPoints: Number(e.target.value)})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <textarea className="flex w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="flex gap-4 pt-4">
              <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>Save Challenge</Button>
              <Button variant="outline" onClick={() => { setIsCreating(false); setIsEditing(null); }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {challenges?.map(challenge => (
          <Card key={challenge.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-3xl">{challenge.icon}</div>
                <div>
                  <h3 className="font-bold text-lg">{challenge.title}</h3>
                  <div className="text-sm text-muted-foreground">{challenge.ecoPoints} pts • Daily: {challenge.isDaily ? "Yes" : "No"}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" onClick={() => openEdit(challenge)}><Edit2 className="w-4 h-4"/></Button>
                <Button size="icon" variant="destructive" onClick={() => handleDelete(challenge.id)}><Trash2 className="w-4 h-4"/></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
