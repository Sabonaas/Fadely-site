import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import BusinessTypesSection from '../components/landing/BusinessTypesSection';
import BenefitsSection from '../components/landing/BenefitsSection';
import MidCTASection from '../components/landing/MidCTASection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import WhyFadelySection from '../components/landing/WhyFadelySection';
import PricingSection from '../components/landing/PricingSection';
import FAQSection from '../components/landing/FAQSection';
import FooterSection from '../components/landing/FooterSection';
import CursorGlow from '../components/CursorGlow';
import { useTheme } from '@/lib/ThemeContext';

export default function Landing() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <>
      <Navbar />
      <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-[#0A0B0F]' : 'bg-white'} relative`}>
        <CursorGlow />
        <HeroSection />
        <BusinessTypesSection />
        <BenefitsSection />
        <MidCTASection />
        <TestimonialsSection />
        <WhyFadelySection />
        <PricingSection />
        <FAQSection />
        <FooterSection />
      </div>
    </>
  );
}