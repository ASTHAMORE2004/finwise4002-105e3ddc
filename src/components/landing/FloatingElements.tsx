import { motion } from "framer-motion";
import { Coins, TrendingUp, PiggyBank, Wallet, IndianRupee } from "lucide-react";

const FloatingElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-glow opacity-50" />

      {/* Floating coins */}
      <motion.div
        className="absolute top-32 left-[15%]"
        animate={{
          y: [-10, 10, -10],
          rotate: [0, 10, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-14 h-14 rounded-full bg-accent/20 backdrop-blur-sm border border-accent/30 flex items-center justify-center">
          <IndianRupee className="w-6 h-6 text-accent" />
        </div>
      </motion.div>

      <motion.div
        className="absolute top-48 right-[20%]"
        animate={{
          y: [10, -15, 10],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      >
        <div className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center">
          <TrendingUp className="w-7 h-7 text-primary" />
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-48 left-[12%]"
        animate={{
          y: [-15, 10, -15],
          x: [-5, 5, -5],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      >
        <div className="w-12 h-12 rounded-full bg-primary/15 backdrop-blur-sm border border-primary/20 flex items-center justify-center">
          <PiggyBank className="w-5 h-5 text-primary" />
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-32 right-[15%]"
        animate={{
          y: [5, -20, 5],
          rotate: [-5, 5, -5],
        }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      >
        <div className="w-14 h-14 rounded-full bg-accent/15 backdrop-blur-sm border border-accent/20 flex items-center justify-center">
          <Wallet className="w-6 h-6 text-accent" />
        </div>
      </motion.div>

      <motion.div
        className="absolute top-[60%] right-[8%]"
        animate={{
          y: [-10, 15, -10],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
      >
        <div className="w-10 h-10 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/15 flex items-center justify-center">
          <Coins className="w-4 h-4 text-primary" />
        </div>
      </motion.div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />
    </div>
  );
};

export default FloatingElements;
