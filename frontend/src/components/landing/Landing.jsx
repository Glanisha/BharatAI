import React, { useRef } from "react";
import { ThemeProvider } from "../../context/ThemeContext";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import FeaturesGrid from "./FeaturesGrid";
import VideoSection from "./VideoSection";
import TestimonialsMarquee from "./TestimonialsMarquee";
import CtaSection from "./CTASection";
import Footer from "./Footer";

const Landing = () => {
  const ctaRef = useRef(null);

  
  return (
    <ThemeProvider>
      <div className="min-h-screen transition-colors duration-300">
        <Navbar />
        <HeroSection />
        <FeaturesGrid />
        <VideoSection />
        <TestimonialsMarquee />
        <CtaSection ref={ctaRef} />
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default Landing;
