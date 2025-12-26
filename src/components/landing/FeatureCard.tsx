import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
  accent?: boolean;
  path?: string;
}

const FeatureCard = ({ icon: Icon, title, description, index, accent, path }: FeatureCardProps) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (path) {
      navigate(path);
    } else {
      navigate('/auth');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={handleClick}
      className="group relative cursor-pointer"
    >
      <div className="glass-card rounded-2xl p-6 sm:p-8 h-full transition-all duration-300 hover:border-primary/30">
        {/* Hover glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative z-10">
          {/* Icon */}
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 ${
            accent 
              ? "bg-accent/20 group-hover:bg-accent/30" 
              : "bg-primary/20 group-hover:bg-primary/30"
          }`}>
            <Icon className={`w-7 h-7 ${accent ? "text-accent" : "text-primary"}`} />
          </div>

          {/* Title */}
          <h3 className="font-display text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed">
            {description}
          </p>

          {/* CTA hint */}
          <p className="text-primary text-sm mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
            Click to explore →
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default FeatureCard;
