import { useState } from "react";
import { Link } from "wouter";
import { useListQuizzes } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, HelpCircle, Leaf, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { TOPICS } from "./learn-hub";

export default function QuizBrowser() {
  const [activeTopic, setActiveTopic] = useState<string>("all");
  const { data: quizzes, isLoading } = useListQuizzes();

  const filteredQuizzes = activeTopic === "all" 
    ? quizzes 
    : quizzes?.filter(q => q.topic === activeTopic);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <header className="mb-10 text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-primary/20 text-primary rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-12">
          <Target className="w-10 h-10 -rotate-12" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Quiz Center</h1>
        <p className="text-lg text-muted-foreground">Test your knowledge, earn points, and unlock special badges. Every correct answer brings you closer to becoming a Green Champion.</p>
      </header>

      {/* Topic Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        <button 
          onClick={() => setActiveTopic("all")}
          className={`px-6 py-2 rounded-full font-bold transition-all ${activeTopic === "all" ? "bg-foreground text-background shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
        >
          All Topics
        </button>
        {TOPICS.map(topic => (
          <button
            key={topic.id}
            onClick={() => setActiveTopic(topic.id)}
            className={`px-6 py-2 rounded-full font-bold transition-all ${activeTopic === topic.id ? `${topic.color} text-white shadow-md` : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            {topic.title}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
      ) : filteredQuizzes?.length === 0 ? (
        <Card className="border-dashed border-2 bg-transparent max-w-xl mx-auto">
          <CardContent className="p-12 text-center text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No quizzes found for this topic.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes?.map((quiz, i) => {
            const topicConfig = TOPICS.find(t => t.id === quiz.topic);
            const totalPoints = quiz.questionCount * quiz.pointsPerQuestion;
            
            return (
              <Link key={quiz.id} href={`/quiz/${quiz.id}`}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="h-full"
                >
                  <Card className="h-full overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2 hover:border-primary/50 group cursor-pointer flex flex-col">
                    <div className={`h-2 w-full ${topicConfig?.color || "bg-primary"}`} />
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <Badge variant="outline" className={`font-semibold capitalize ${topicConfig?.textLight} bg-background`}>
                          {quiz.topic.replace("_", " ")}
                        </Badge>
                        <div className="bg-primary/10 text-primary px-3 py-1 rounded-lg font-extrabold text-sm flex items-center gap-1">
                          <Leaf className="w-4 h-4" /> {totalPoints} pts
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{quiz.title}</h3>
                      <p className="text-muted-foreground text-sm mb-6 flex-1 line-clamp-2">{quiz.description}</p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                          <HelpCircle className="w-4 h-4" /> {quiz.questionCount} Questions
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
