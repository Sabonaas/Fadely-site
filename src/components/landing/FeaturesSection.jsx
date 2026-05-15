import { motion } from 'framer-motion';
import { Calendar, Users, BarChart3, Smartphone, Zap, Shield, Clock, Globe } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

const features = [
  { icon: Calendar, title: 'Smart Scheduling', description: 'AI-powered appointment scheduling with drag & drop calendar.' },
  { icon: Globe, title: 'Online Booking', description: 'Beautiful public booking page for your clients.' },
  { icon: Users, title: 'Client Management', description: 'Complete CRM for beauty businesses with history tracking.' },
  { icon: Smartphone, title: 'WhatsApp Automation', description: 'Automatic confirmations, reminders, and follow-ups.' },
  { icon: BarChart3, title: 'Analytics & Reports', description: 'Real-time insights on revenue, clients, and performance.' },
  { icon: Zap, title: 'Team Management', description: 'Manage employees, schedules, and commissions.' },
  { icon: Shield, title: 'Secure Payments', description: 'PIX, credit card, and boleto payment tracking.' },
  { icon: Clock, title: 'Time Optimization', description: 'Reduce no-shows and maximize your schedule utilization.' },
];

export default function FeaturesSection() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section id="features" className={`py-32 relative transition-colors duration-500 ${isDark ? 'bg-[#0A0B0F]' : 'bg-white'}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-600/3 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(10,12,20,0.9)' }}>
            Everything you need
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)' }}>
            One platform to run your entire beauty business, from booking to billing.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group p-6 rounded-2xl transition-all duration-500"
              style={{
                border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)',
                background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
              }}
            >
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                <feature.icon className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(10,12,20,0.85)' }}>{feature.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)' }}>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}