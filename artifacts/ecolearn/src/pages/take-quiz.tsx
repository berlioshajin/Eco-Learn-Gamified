import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useGetQuiz, useSubmitQuizAttempt } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, ArrowLeft, CheckCircle2, XCircle, Trophy, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TakeQuiz() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const quizId = Number(params.id);

  const { data: quiz, isLoading } = useGetQuiz(quizId);
  const submitMutation = useSubmitQuizAttempt();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<any>(null);

  if (isLoading) return <div className="h-screen flex justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  if (!quiz || !quiz.questions) return <div className="p-10 text-center font-bold text-destructive">Quiz not found or has no questions.</div>;

  const isComplete = currentIndex >= quiz.questions.length;
  const currentQuestion = quiz.questions[currentIndex];
  const progress = (Object.keys(answers).length / quiz.questions.length) * 100;

  const handleSelectOption = (optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionIndex }));
  };

  const handleNext = () => {
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Submit
      const formattedAnswers = Object.entries(answers).map(([qId, opt]) => ({
        questionId: Number(qId),
        selectedOption: opt
      }));
      submitMutation.mutate({ id: quizId, data: { answers: formattedAnswers } }, {
        onSuccess: (data) => {
          setResult(data);
        }
      });
    }
  };

  if (result) {
    const isPerfect = result.score === 100;
    return (
      <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-2xl w-full text-center">
          <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-8 shadow-2xl ${isPerfect ? 'bg-yellow-400 text-white' : 'bg-primary text-white'}`}>
            <Trophy className="w-16 h-16" />
          </div>
          <h1 className="text-5xl font-extrabold mb-4">{isPerfect ? "Perfect Score!" : "Quiz Complete!"}</h1>
          <p className="text-2xl text-muted-foreground font-medium mb-10">You scored <span className="text-foreground font-black">{result.score}%</span> and earned <span className="text-primary font-black flex inline-flex items-center gap-1"><Leaf className="w-6 h-6"/> {result.pointsEarned} pts</span></p>
          
          {result.newBadges && result.newBadges.length > 0 && (
            <div className="bg-accent/20 border border-accent/30 rounded-3xl p-6 mb-10 inline-block">
              <h3 className="font-bold text-lg mb-4 text-accent-foreground">New Badges Unlocked!</h3>
              <div className="flex gap-4 justify-center">
                {result.newBadges.map((b: any) => (
                  <div key={b.id} className="text-center">
                    <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center text-2xl shadow-sm mx-auto mb-2 border border-border">🌟</div>
                    <div className="text-sm font-bold">{b.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => setLocation('/quiz')}>Back to Quizzes</Button>
            <Button size="lg" variant="outline" onClick={() => setLocation('/dashboard')}>Go to Dashboard</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-6 border-b border-border bg-card sticky top-0 z-10 flex items-center justify-between">
        <Link href="/quiz" className="p-2 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="font-bold text-lg">{quiz.title}</div>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <div className="flex-1 max-w-3xl w-full mx-auto p-6 md:p-10 flex flex-col">
        <div className="mb-10">
          <div className="flex justify-between text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
            <span>Question {currentIndex + 1} of {quiz.questions.length}</span>
            <span>{Math.round(progress)}% Completed</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        <AnimatePresence mode="wait">
          {!isComplete && currentQuestion && (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mb-10">
                {currentQuestion.questionText}
              </h2>

              <div className="space-y-4 flex-1">
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = answers[currentQuestion.id] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-200 text-lg font-semibold flex items-center gap-4 ${
                        isSelected 
                          ? "border-primary bg-primary/5 text-primary" 
                          : "border-border hover:border-primary/50 hover:bg-muted"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30 text-muted-foreground"}`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      {opt}
                    </button>
                  );
                })}
              </div>

              <div className="mt-10 pt-6 border-t border-border flex justify-end">
                <Button 
                  size="lg" 
                  className="text-lg px-12 h-14"
                  disabled={answers[currentQuestion.id] === undefined || submitMutation.isPending}
                  onClick={handleNext}
                >
                  {submitMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : 
                   currentIndex === quiz.questions.length - 1 ? "Submit Quiz" : "Next Question"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
