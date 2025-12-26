import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { TrendingUp, BookOpen, Video, ArrowRight } from "lucide-react";

const products = [
  {
    icon: TrendingUp,
    title: "IPO Listings",
    description: "Discover and apply for the latest Initial Public Offerings. Track upcoming, open, and closed IPOs with real-time subscription data.",
    path: "/ipo",
    gradient: "from-emerald-500 to-teal-600",
    bgGlow: "bg-emerald-500/20",
  },
  {
    icon: BookOpen,
    title: "Learning Courses",
    description: "Master financial literacy with bite-sized video lessons. From budgeting basics to advanced investing strategies.",
    path: "/courses",
    gradient: "from-violet-500 to-purple-600",
    bgGlow: "bg-violet-500/20",
  },
  {
    icon: Video,
    title: "Video Consultations",
    description: "Connect with financial experts through live video calls. Get personalized advice for your investment journey.",
    path: "/video-call",
    gradient: "from-orange-500 to-red-500",
    bgGlow: "bg-orange-500/20",
  },
];

const ProductsSection = () => {
  const navigate = useNavigate();

  return (
    <section id="products" className="py-24 lg:py-32 relative overflow-hidden bg-secondary/30">
      {/* Background elements */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[150px] -translate-y-1/2" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6"
          >
            <span className="text-sm text-primary font-medium">Explore Our Platform</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6"
          >
            Your Complete
            <br />
            <span className="text-gradient-primary">Financial Toolkit</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-muted-foreground"
          >
            Access IPO investments, educational courses, and expert consultations all in one place.
          </motion.p>
        </div>

        {/* Product Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              onClick={() => navigate(product.path)}
              className="group cursor-pointer relative"
            >
              {/* Card Glow */}
              <div className={`absolute inset-0 ${product.bgGlow} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Card */}
              <div className="relative glass-card rounded-2xl p-8 h-full border border-border/50 hover:border-primary/50 transition-all duration-300 group-hover:-translate-y-2">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${product.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                  <product.icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="font-display text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {product.title}
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {product.description}
                </p>

                {/* CTA */}
                <div className="flex items-center gap-2 text-primary font-medium">
                  <span>Explore Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
