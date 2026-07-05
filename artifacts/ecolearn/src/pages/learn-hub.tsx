import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ThermometerSun, Trash2, Droplets, Lightbulb, Sprout, ArrowRight } from "lucide-react";

export const TOPICS = [
  {
    id: "climate_change",
    title: "Climate Change",
    description: "Understand global warming, greenhouse gases, and their impact on our planet.",
    color: "bg-red-500",
    bgLight: "bg-red-500/10",
    textLight: "text-red-600",
    icon: ThermometerSun
  },
  {
    id: "waste_management",
    title: "Waste Management",
    description: "Learn about recycling, composting, and reducing single-use plastics.",
    color: "bg-amber-600",
    bgLight: "bg-amber-600/10",
    textLight: "text-amber-700",
    icon: Trash2
  },
  {
    id: "water_conservation",
    title: "Water Conservation",
    description: "Discover why every drop counts and how to protect our water resources.",
    color: "bg-blue-500",
    bgLight: "bg-blue-500/10",
    textLight: "text-blue-600",
    icon: Droplets
  },
  {
    id: "energy_saving",
    title: "Energy Saving",
    description: "Explore renewable energy and smart habits to reduce power consumption.",
    color: "bg-yellow-400",
    bgLight: "bg-yellow-400/10",
    textLight: "text-yellow-600",
    icon: Lightbulb
  },
  {
    id: "biodiversity",
    title: "Biodiversity",
    description: "Dive into ecosystems, endangered species, and why variety is vital to life.",
    color: "bg-green-500",
    bgLight: "bg-green-500/10",
    textLight: "text-green-600",
    icon: Sprout
  }
];

export default function LearnHub() {
  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <header className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Learning Hub</h1>
        <p className="text-lg text-muted-foreground">Pick a topic to start exploring. Master these concepts to unlock quizzes and earn eco-points.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TOPICS.map((topic, i) => {
          const Icon = topic.icon;
          return (
            <Link key={topic.id} href={`/learn/${topic.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="cursor-pointer h-full"
              >
                <Card className={`h-full border-2 hover:border-transparent transition-colors overflow-hidden group`}>
                  <div className={`h-3 w-full ${topic.color}`} />
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 rounded-2xl ${topic.bgLight} ${topic.textLight} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{topic.title}</h3>
                    <p className="text-muted-foreground mb-6 line-clamp-3">{topic.description}</p>
                    <div className={`font-semibold flex items-center gap-2 ${topic.textLight}`}>
                      Explore Topic <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
