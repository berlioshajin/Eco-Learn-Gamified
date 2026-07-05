import { useParams, Link } from "wouter";
import { useListLessons } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TOPICS } from "./learn-hub";
import { Loader2, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function TopicLessons() {
  const params = useParams();
  const topicId = params.topic;
  
  const { data: lessons, isLoading } = useListLessons({ topic: topicId });

  const topicConfig = TOPICS.find(t => t.id === topicId);

  if (!topicConfig) {
    return <div className="p-10 text-center text-xl font-bold text-destructive">Topic not found</div>;
  }

  const Icon = topicConfig.icon;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <Link href="/learn" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Hub
      </Link>

      <header className={`p-10 rounded-3xl ${topicConfig.bgLight} border border-border flex flex-col md:flex-row items-center gap-8 text-center md:text-left`}>
        <div className={`w-24 h-24 rounded-3xl ${topicConfig.color} text-white flex items-center justify-center shadow-lg flex-shrink-0`}>
          <Icon className="w-12 h-12" />
        </div>
        <div>
          <h1 className={`text-4xl font-extrabold tracking-tight mb-3 ${topicConfig.textLight}`}>{topicConfig.title}</h1>
          <p className="text-lg text-foreground/80 max-w-2xl">{topicConfig.description}</p>
        </div>
      </header>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Lessons ({lessons?.length || 0})</h2>
        
        {isLoading ? (
          <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : lessons?.length === 0 ? (
          <Card className="border-dashed border-2 bg-transparent">
            <CardContent className="p-12 text-center text-muted-foreground">
              <p className="text-lg font-medium">No lessons available yet for this topic.</p>
              <p className="text-sm">Check back later!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lessons?.map((lesson, i) => (
              <Link key={lesson.id} href={`/learn/lesson/${lesson.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="h-full"
                >
                  <Card className="h-full overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col">
                    <div className="h-48 bg-muted relative overflow-hidden flex items-center justify-center">
                      {lesson.imageUrl ? (
                        <img src={lesson.imageUrl} alt={lesson.title} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
                      )}
                      <div className="absolute top-4 left-4">
                        <Badge className={`bg-background/90 text-foreground backdrop-blur-sm border-none`}>
                          {lesson.difficulty || "Beginner"}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold mb-2 line-clamp-2">{lesson.title}</h3>
                      <p className="text-muted-foreground mb-4 line-clamp-2 flex-1">{lesson.summary}</p>
                      <div className={`font-semibold flex items-center gap-2 ${topicConfig.textLight}`}>
                        Start Lesson <ArrowLeft className="w-4 h-4 rotate-180" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
