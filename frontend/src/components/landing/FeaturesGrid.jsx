import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const FeaturesGrid = () => {
  const { isDark } = useTheme();

  const features = [
    {
      title: 'Multi-Language Support',
      description: 'Native support for Hindi, Tamil, Bengali, and 8+ Indian languages',
      icon: '🌍',
      size: 'col-span-1 row-span-1',
      gradient: 'from-blue-500/20 to-purple-500/20'
    },
    {
      title: 'AI-Powered Content',
      description: 'Intelligent content generation and personalized learning paths',
      icon: '🤖',
      size: 'col-span-2 row-span-1',
      gradient: 'from-green-500/20 to-blue-500/20'
    },
    {
      title: 'Real-time Analytics',
      description: 'Track student progress and engagement with detailed insights',
      icon: '📊',
      size: 'col-span-1 row-span-2',
      gradient: 'from-orange-500/20 to-red-500/20'
    },
    {
      title: 'Interactive Lessons',
      description: 'Engaging multimedia content with quizzes and assignments',
      icon: '🎯',
      size: 'col-span-1 row-span-1',
      gradient: 'from-purple-500/20 to-pink-500/20'
    },
    {
      title: 'Mobile First',
      description: 'Optimized for smartphones and tablets across all platforms',
      icon: '📱',
      size: 'col-span-1 row-span-1',
      gradient: 'from-cyan-500/20 to-blue-500/20'
    },
    {
      title: 'Secure & Private',
      description: 'Enterprise-grade security with full data privacy compliance',
      icon: '🔒',
      size: 'col-span-2 row-span-1',
      gradient: 'from-red-500/20 to-orange-500/20'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section id="features" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className={`
            text-4xl md:text-5xl font-bold mb-6
            ${isDark ? 'text-[#f8f8f8]' : 'text-[#080808]'}
          `}>
            Powerful Features
          </h2>
          <p className={`
            text-xl max-w-2xl mx-auto
            ${isDark ? 'text-[#f8f8f8]/70' : 'text-[#080808]/70'}
          `}>
            Everything you need to create, manage, and deliver exceptional learning experiences
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-3 grid-rows-3 gap-4 h-[600px]"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              className={`
                ${feature.size} p-6 rounded-2xl cursor-pointer group
                ${isDark 
                  ? 'bg-[#080808] border border-[#f8f8f8]/20 hover:border-[#f8f8f8]/40' 
                  : 'bg-[#f8f8f8] border border-[#080808]/20 hover:border-[#080808]/40'
                }
                relative overflow-hidden transition-all duration-300
              `}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              <div className="relative z-10 h-full flex flex-col">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className={`
                  text-xl font-bold mb-3
                  ${isDark ? 'text-[#f8f8f8]' : 'text-[#080808]'}
                `}>
                  {feature.title}
                </h3>
                <p className={`
                  text-sm leading-relaxed
                  ${isDark ? 'text-[#f8f8f8]/70' : 'text-[#080808]/70'}
                `}>
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesGrid;