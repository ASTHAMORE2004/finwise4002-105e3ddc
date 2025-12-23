import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookOpen, Award, Brain, ArrowRight } from "lucide-react";

const modules = [
  { title: "Budgeting Basics", lessons: 8, progress: 0 },
  { title: "Understanding Credit", lessons: 6, progress: 0 },
  { title: "SIPs Made Simple", lessons: 5, progress: 0 },
  { title: "Tax for Students", lessons: 7, progress: 0 },
];

const LearnSection = () => {
  return (
    <section id="learn" data-tour="learn" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-glow opacity-30" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Financial Education</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Learn Finance,
              <br />
              <span className="text-gradient-primary">The Fun Way</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Bite-sized lessons that fit between classes. Interactive quizzes, real-world examples, 
              and an AI advisor that answers your money questions 24/7.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Earn Badges</div>
                  <div className="text-sm text-muted-foreground">Complete modules</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">AI Advisor</div>
                  <div className="text-sm text-muted-foreground">Personal tips</div>
                </div>
              </div>
            </div>

            <Button variant="gradient" className="group">
              Start Learning Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          {/* Course Cards */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {modules.map((module, index) => (
              <motion.div
                key={module.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, x: 8 }}
                className="glass-card rounded-xl p-5 flex items-center justify-between group cursor-pointer hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center font-display font-bold text-foreground">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-foreground">{module.title}</h4>
                    <p className="text-sm text-muted-foreground">{module.lessons} lessons</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LearnSection;
