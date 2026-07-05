import { useListChallenges, useCompleteChallenge } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Leaf, CheckCircle2, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListChallengesQueryKey } from "@workspace/api-client-react";

export default function Challenges() {
  const { data: challenges, isLoading } = useListChallenges();
  const completeMutation = useCompleteChallenge();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleComplete = (id: number) => {
    completeMutation.mutate({ id }, {
      onSuccess: (data) => {
        toast({
          title: "Challenge Completed! 🎉",
          description: `You earned ${data.pointsAwarded} eco-points.`,
          variant: "default",
        });
        queryClient.invalidateQueries({ queryKey: getListChallengesQueryKey() });
      }
    });
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <header className="mb-10 max-w-2xl">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 flex items-center gap-3">
          <Zap className="w-10 h-10 text-secondary" /> Daily Action Board
        </h1>
        <p className="text-lg text-muted-foreground">Turn learning into action. Complete real-world tasks to make a difference and earn huge point bonuses.</p>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
      ) : challenges?.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground text-lg">No challenges available right now.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges?.map((challenge, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={challenge.id}
              className="h-full"
            >
              <Card className={`h-full border-2 transition-all duration-300 ${challenge.completedToday ? "bg-muted/30 border-muted opacity-70 grayscale-[0.2]" : "hover:border-secondary hover:shadow-lg hover:-translate-y-1"}`}>
                <CardContent className="p-6 flex flex-col h-full relative overflow-hidden">
                  {challenge.completedToday && (
                    <div className="absolute -right-12 top-6 bg-primary text-white font-bold py-1 px-12 rotate-45 text-sm shadow-md">
                      DONE
                    </div>
                  )}
                  
                  <div className="w-16 h-16 rounded-2xl bg-secondary/20 text-secondary flex items-center justify-center text-3xl mb-6 shadow-inner">
                    {/* Backend sends icon string, fallback to leaf if not an emoji, but we shouldn't use emojis. The backend seed uses emojis. We will render it if it's text, but we should wrap it. */}
                    <span className="drop-shadow-sm">{challenge.icon}</span>
                  </div>
                  
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="text-xl font-bold leading-tight">{challenge.title}</h3>
                    <Badge variant="secondary" className="font-extrabold bg-secondary text-secondary-foreground shrink-0 border-none">
                      +{challenge.ecoPoints}
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground mb-8 flex-1">{challenge.description}</p>
                  
                  <Button 
                    className="w-full font-bold h-12 text-lg" 
                    variant={challenge.completedToday ? "outline" : "default"}
                    disabled={challenge.completedToday || completeMutation.isPending}
                    onClick={() => handleComplete(challenge.id)}
                  >
                    {challenge.completedToday ? (
                      <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Completed</span>
                    ) : (
                      "Mark as Done"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
