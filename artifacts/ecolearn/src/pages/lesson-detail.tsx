import { useParams, Link } from "wouter";
import { useGetLesson, useListQuizzes } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Target, Calendar } from "lucide-react";

export default function LessonDetail() {
  const params = useParams();
  const lessonId = Number(params.id);

  const { data: lesson, isLoading } = useGetLesson(lessonId);
  const { data: quizzes } = useListQuizzes({ topic: lesson?.topic }, { query: { enabled: !!lesson?.topic, queryKey: ["listQuizzes", lesson?.topic] } });

  if (isLoading) {
    return <div className="h-screen flex justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  if (!lesson) {
    return <div className="p-10 text-center font-bold text-destructive">Lesson not found</div>;
  }

  // Find a related quiz for this topic
  const relatedQuiz = quizzes?.[0];

  return (
    <article className="max-w-4xl mx-auto min-h-screen bg-card shadow-sm border-x border-border">
      {lesson.imageUrl && (
        <div className="w-full h-[40vh] md:h-[50vh] relative">
          <img src={lesson.imageUrl} alt={lesson.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute top-6 left-6">
            <Link href={`/learn/${lesson.topic}`} className="inline-flex items-center gap-2 bg-background/80 backdrop-blur-md px-4 py-2 rounded-full font-semibold hover:bg-background transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to {lesson.topic.replace("_", " ")}
            </Link>
          </div>
        </div>
      )}
      
      <div className="p-6 md:p-12 -mt-20 relative z-10">
        {!lesson.imageUrl && (
          <Link href={`/learn/${lesson.topic}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to {lesson.topic.replace("_", " ")}
          </Link>
        )}

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Badge className="bg-primary/20 text-primary hover:bg-primary/30 text-sm py-1 px-3 border-none capitalize">
            {lesson.topic.replace("_", " ")}
          </Badge>
          <Badge variant="outline" className="text-sm py-1 px-3 capitalize">
            {lesson.difficulty || "Beginner"}
          </Badge>
          <span className="text-sm text-muted-foreground flex items-center gap-1 font-medium">
            <Calendar className="w-4 h-4" />
            {new Date(lesson.createdAt).toLocaleDateString()}
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-6 text-foreground">
          {lesson.title}
        </h1>

        <div className="text-xl text-muted-foreground font-medium leading-relaxed mb-10 border-l-4 border-primary pl-6 py-2">
          {lesson.summary}
        </div>

        {/* Lesson Content - using prose for typography styling */}
        <div 
          className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80"
          dangerouslySetInnerHTML={{ __html: lesson.content }}
        />

        {/* Related Action */}
        {relatedQuiz && (
          <div className="mt-16 p-8 rounded-3xl bg-secondary/10 border border-secondary/20 text-center">
            <div className="w-16 h-16 bg-secondary text-secondary-foreground rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Target className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-foreground">Ready to test your knowledge?</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Take the related quiz to earn eco-points and prove you mastered this topic.
            </p>
            <Link href={`/quiz/${relatedQuiz.id}`}>
              <Button size="lg" className="text-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-secondary/20">
                Take Quiz: {relatedQuiz.title}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
