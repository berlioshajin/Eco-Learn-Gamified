import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Leaf, Globe, Zap, Users, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navbar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
            <Leaf className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-primary">EcoLearn</span>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={() => setLocation('/login')}>Log In</Button>
          <Button onClick={() => setLocation('/register')}>Start Learning</Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 py-20 md:py-32 flex flex-col items-center text-center max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 text-secondary-foreground font-semibold text-sm mb-6"
          >
            <TrophyIcon className="w-4 h-4" />
            <span>Join 10,000+ students saving the planet</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight"
          >
            Gamify your <span className="text-primary">green journey</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground mb-10 max-w-2xl"
          >
            Learn about climate change, complete daily eco-challenges, earn badges, and compete with schools worldwide. Every point makes a difference.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Button size="lg" className="gap-2 text-lg" onClick={() => setLocation('/register')}>
              Join for Free <ArrowRight className="w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg" onClick={() => setLocation('/login')}>
              I have an account
            </Button>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="bg-card py-20 border-y border-border">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10">
            <FeatureCard 
              icon={<Globe className="w-8 h-8" />}
              title="Interactive Lessons"
              description="Bite-sized modules on biodiversity, energy saving, and waste management."
              color="bg-accent/20 text-accent-foreground"
            />
            <FeatureCard 
              icon={<Zap className="w-8 h-8" />}
              title="Daily Challenges"
              description="Turn knowledge into action. Plant a tree, save water, and earn eco-points."
              color="bg-secondary/20 text-secondary-foreground"
            />
            <FeatureCard 
              icon={<Users className="w-8 h-8" />}
              title="Global Leaderboards"
              description="Compete with classmates and students worldwide to become a Green Champion."
              color="bg-primary/20 text-primary"
            />
          </div>
        </section>
      </main>

      <footer className="bg-background py-10 text-center border-t border-border">
        <p className="text-muted-foreground font-medium">© 2025 EcoLearn. Built for a better future.</p>
      </footer>
    </div>
  );
}

function TrophyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7c0 6 6 8 6 8s6-2 6-8V2z" />
    </svg>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 rounded-3xl bg-background border border-border shadow-sm flex flex-col items-center text-center"
    >
      <div className={`p-4 rounded-2xl mb-6 ${color}`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}
