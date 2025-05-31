import React from "react";
import { ThemeProvider } from "../../context/ThemeContext";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import FeaturesGrid from "./FeaturesGrid";
import TestimonialsMarquee from "./TestimonialsMarquee";
import Footer from "./Footer";

const Landing = () => {
  return (
    <ThemeProvider>
      <div className="min-h-screen transition-colors duration-300">
        <Navbar />
        <HeroSection />
        <FeaturesGrid />
        <TestimonialsMarquee />
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default Landing;
