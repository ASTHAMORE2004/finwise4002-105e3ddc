import { motion } from "framer-motion";
import { Coins, TrendingUp, PiggyBank, Wallet, IndianRupee, CircleDollarSign, Gem } from "lucide-react";

const FloatingElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/15 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-glow opacity-50" />
      
      {/* Golden glow effect */}
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-accent/20 rounded-full blur-[80px] animate-pulse" />
      <div className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-accent/25 rounded-full blur-[60px]" />

      {/* Main gold coin - Large */}
      <motion.div
        className="absolute top-24 left-[10%]"
        animate={{
          y: [-10, 15, -10],
          rotate: [0, 15, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 shadow-[0_0_30px_rgba(251,191,36,0.5)] flex items-center justify-center border-4 border-amber-300/50">
          <IndianRupee className="w-10 h-10 text-amber-900" />
        </div>
      </motion.div>

      {/* Gold coin 2 */}
      <motion.div
        className="absolute top-40 right-[15%]"
        animate={{
          y: [10, -20, 10],
          rotate: [0, -10, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 shadow-[0_0_25px_rgba(251,191,36,0.4)] flex items-center justify-center border-3 border-yellow-300/50">
          <CircleDollarSign className="w-8 h-8 text-amber-900" />
        </div>
      </motion.div>

      {/* Gold coin 3 - Smaller */}
      <motion.div
        className="absolute top-[30%] left-[5%]"
        animate={{
          y: [-15, 10, -15],
          x: [-5, 8, -5],
          rotate: [0, 20, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(251,191,36,0.35)] flex items-center justify-center border-2 border-amber-200/50">
          <Coins className="w-6 h-6 text-amber-800" />
        </div>
      </motion.div>

      {/* Gold coin 4 */}
      <motion.div
        className="absolute top-[55%] right-[8%]"
        animate={{
          y: [5, -25, 5],
          rotate: [-10, 15, -10],
        }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.8,
        }}
      >
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 shadow-[0_0_22px_rgba(251,191,36,0.4)] flex items-center justify-center border-2 border-yellow-200/50">
          <IndianRupee className="w-7 h-7 text-amber-800" />
        </div>
      </motion.div>

      {/* Gold coin 5 - Bottom left */}
      <motion.div
        className="absolute bottom-32 left-[8%]"
        animate={{
          y: [-20, 10, -20],
          x: [5, -5, 5],
          rotate: [5, -15, 5],
        }}
        transition={{
          duration: 6.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
      >
        <div className="w-18 h-18 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 shadow-[0_0_28px_rgba(251,191,36,0.45)] flex items-center justify-center border-3 border-amber-300/50" style={{ width: '72px', height: '72px' }}>
          <Gem className="w-9 h-9 text-amber-900" />
        </div>
      </motion.div>

      {/* Gold coin 6 - Bottom right */}
      <motion.div
        className="absolute bottom-48 right-[12%]"
        animate={{
          y: [10, -15, 10],
          rotate: [-5, 10, -5],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      >
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 shadow-[0_0_24px_rgba(251,191,36,0.4)] flex items-center justify-center border-2 border-yellow-300/50">
          <Wallet className="w-7 h-7 text-amber-800" />
        </div>
      </motion.div>

      {/* Smaller floating gold coins */}
      <motion.div
        className="absolute top-[70%] left-[20%]"
        animate={{
          y: [-8, 12, -8],
          rotate: [0, 25, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.3,
        }}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.3)] flex items-center justify-center border border-amber-200/40">
          <Coins className="w-5 h-5 text-amber-800" />
        </div>
      </motion.div>

      <motion.div
        className="absolute top-[20%] right-[25%]"
        animate={{
          y: [12, -10, 12],
          x: [-3, 5, -3],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.2,
        }}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 shadow-[0_0_15px_rgba(251,191,36,0.3)] flex items-center justify-center border border-yellow-200/40">
          <IndianRupee className="w-5 h-5 text-amber-800" />
        </div>
      </motion.div>

      {/* Tiny gold sparkles */}
      <motion.div
        className="absolute top-[45%] left-[30%]"
        animate={{
          scale: [0.8, 1.2, 0.8],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-300 to-yellow-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
      </motion.div>

      <motion.div
        className="absolute top-[35%] right-[35%]"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      >
        <div className="w-2 h-2 rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
      </motion.div>

      <motion.div
        className="absolute bottom-[40%] right-[28%]"
        animate={{
          scale: [0.9, 1.3, 0.9],
          opacity: [0.4, 0.9, 0.4],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      >
        <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
      </motion.div>

      {/* Green investment icons */}
      <motion.div
        className="absolute top-48 right-[22%]"
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
        <div className="w-14 h-14 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center">
          <TrendingUp className="w-7 h-7 text-primary" />
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-56 left-[18%]"
        animate={{
          y: [-12, 15, -12],
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
          <PiggyBank className="w-6 h-6 text-primary" />
        </div>
      </motion.div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
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
