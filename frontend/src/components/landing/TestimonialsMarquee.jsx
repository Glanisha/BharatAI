import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

const TestimonialsMarquee = () => {
  const { isDark } = useTheme();

  const testimonials = [
    {
      name: "Dr. Priya Sharma",
      role: "Professor, Delhi University",
      content:
        "BharatAI has transformed how I teach. The Hindi language support makes complex concepts accessible to all my students.",
      rating: 5,
    },
    {
      name: "Rajesh Kumar",
      role: "High School Teacher",
      content:
        "The AI-powered content generation saves me hours of preparation time. My students are more engaged than ever.",
      rating: 5,
    },
    {
      name: "Meera Patel",
      role: "Online Educator",
      content:
        "Finally, a platform that understands the Indian education system. The multi-language support is phenomenal.",
      rating: 5,
    },
    {
      name: "Arjun Singh",
      role: "Training Institute Owner",
      content:
        "Our enrollment has increased by 200% since we started using BharatAI. The analytics help us improve constantly.",
      rating: 5,
    },
    {
      name: "Kavitha Nair",
      role: "Language Teacher",
      content:
        "Teaching Malayalam online has never been easier. The platform adapts to regional learning patterns beautifully.",
      rating: 5,
    },
    {
      name: "Suresh Gupta",
      role: "Vocational Trainer",
      content:
        "The mobile-first approach means my students can learn anywhere. Perfect for India's diverse learning environments.",
      rating: 5,
    },
    {
      name: "Anita Desai",
      role: "Primary School Principal",
      content:
        "Our teachers love how easy it is to create engaging lessons. Student participation has improved dramatically.",
      rating: 5,
    },
    {
      name: "Vikram Choudhary",
      role: "Engineering Professor",
      content:
        "The technical course creation tools are exceptional. Complex engineering concepts are now easier to explain.",
      rating: 5,
    },
    {
      name: "Ritu Agarwal",
      role: "Language Institute Director",
      content:
        "Perfect for teaching multiple Indian languages. The cultural context awareness is impressive.",
      rating: 5,
    },
    {
      name: "Deepak Mehta",
      role: "Skill Development Trainer",
      content:
        "Rural students can now access quality education. This platform is bridging the digital divide effectively.",
      rating: 5,
    },
    {
      name: "Sunita Roy",
      role: "Mathematics Teacher",
      content:
        "Complex mathematical concepts are now visual and interactive. Students actually enjoy math class now!",
      rating: 5,
    },
    {
      name: "Manish Pandey",
      role: "Corporate Trainer",
      content:
        "Training professionals across different languages has never been this smooth. Excellent platform!",
      rating: 5,
    },
  ];

  // Create four columns
  const column1 = testimonials.slice(0, 3);
  const column2 = testimonials.slice(3, 6);
  const column3 = testimonials.slice(6, 9);
  const column4 = testimonials.slice(9, 12);

  const TestimonialCard = ({ testimonial }) => (
    <div
      className={`
      p-4 rounded-lg mb-3 max-w-xs mx-auto flex-shrink-0
      ${
        isDark
          ? "bg-[#080808] border border-[#f8f8f8]/20"
          : "bg-[#f8f8f8] border border-[#080808]/20"
      }
      shadow-sm hover:shadow-md transition-shadow duration-200
    `}
    >
      <div className="flex mb-2">
        {[...Array(testimonial.rating)].map((_, i) => (
          <span
            key={i}
            className={`text-xs ${
              isDark ? "text-[#4a4494]" : "text-[#222052]"
            }`}
          >
            ★
          </span>
        ))}
      </div>
      <p
        className={`
        text-xs mb-3 leading-relaxed
        ${isDark ? "text-[#f8f8f8]/80" : "text-[#080808]/80"}
      `}
      >
        "{testimonial.content}"
      </p>
      <div>
        <p
          className={`
          font-semibold text-xs
          ${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}
        `}
        >
          {testimonial.name}
        </p>
        <p
          className={`
          text-xs opacity-70
          ${isDark ? "text-[#f8f8f8]/60" : "text-[#080808]/60"}
        `}
        >
          {testimonial.role}
        </p>
      </div>
    </div>
  );

  const MarqueeColumn = ({ testimonials, direction, columnIndex }) => {
    const animationName = direction === "up" ? "marquee-up" : "marquee-down";

    return (
      <div
        className="relative flex flex-col group"
        style={{
          overflow: "hidden",
          height: "320px",
        }}
      >
        <div
          className="flex flex-col will-change-transform"
          style={{
            animation: `${animationName} 20s linear infinite`,
            animationPlayState: "running",
          }}
        >
          {/* Create multiple sets for seamless infinite loop */}
          {[...testimonials, ...testimonials, ...testimonials].map(
            (testimonial, index) => (
              <TestimonialCard
                key={`${columnIndex}-${index}`}
                testimonial={testimonial}
              />
            )
          )}
        </div>
      </div>
    );
  };

  return (
    <section id="testimonials" className="py-20 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2
            className={`
            text-4xl md:text-5xl font-bold mb-6
            ${isDark ? "text-[#f8f8f8]" : "text-[#080808]"}
          `}
          >
            Loved by Educators
          </h2>
          <p
            className={`
            text-xl max-w-2xl mx-auto
            ${isDark ? "text-[#f8f8f8]/70" : "text-[#080808]/70"}
          `}
          >
            Thousands of teachers across India trust BharatAI for their
            educational needs
          </p>
        </motion.div>
      </div>

      {/* Four columns with tight spacing */}
      <div className="flex space-x-2 px-4 max-w-5xl mx-auto">
        <div className="flex-1">
          <MarqueeColumn
            testimonials={column1}
            direction="up"
            columnIndex={0}
          />
        </div>
        <div className="flex-1">
          <MarqueeColumn
            testimonials={column2}
            direction="down"
            columnIndex={1}
          />
        </div>
        <div className="flex-1">
          <MarqueeColumn
            testimonials={column3}
            direction="up"
            columnIndex={2}
          />
        </div>
        <div className="flex-1">
          <MarqueeColumn
            testimonials={column4}
            direction="down"
            columnIndex={3}
          />
        </div>
      </div>

      {/* Fixed CSS Animations */}
      <style jsx>{`
        @keyframes marquee-up {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-33.33%);
          }
        }
        @keyframes marquee-down {
          0% {
            transform: translateY(-33.33%);
          }
          100% {
            transform: translateY(0);
          }
        }


        .group:hover .flex.flex-col.will-change-transform {
        animation-play-state: paused !important;
      `}</style>
    </section>
  );
};

export default TestimonialsMarquee;
