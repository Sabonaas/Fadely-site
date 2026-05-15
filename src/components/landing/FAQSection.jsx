import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

const faqs = [
  {
    q: 'O Fadely é gratuito?',
    a: 'Sim! Você tem 14 dias de teste grátis com acesso a todas as funcionalidades, sem precisar cadastrar cartão de crédito. Após o trial, os planos começam a partir de R$79/mês.',
  },
  {
    q: 'Preciso instalar algum aplicativo?',
    a: 'Não. O Fadely funciona 100% no navegador, em qualquer dispositivo: celular, tablet ou computador. Seus clientes também agendam direto pelo link, sem instalar nada.',
  },
  {
    q: 'Como funciona o agendamento online?',
    a: 'Você recebe um link personalizado (ex: fadely.com.br/seu-salao) que pode compartilhar no Instagram, WhatsApp e Google Meu Negócio. Seus clientes escolhem o serviço, profissional e horário — e você é notificado em tempo real.',
  },
  {
    q: 'Os lembretes via WhatsApp são automáticos?',
    a: 'Sim! O Fadely envia automaticamente uma confirmação após o agendamento e um lembrete 24h antes da consulta. Isso reduz as faltas em até 70% sem nenhum trabalho manual da sua parte.',
  },
  {
    q: 'Posso gerenciar vários funcionários?',
    a: 'Com certeza. Você pode cadastrar toda sua equipe, definir os serviços de cada profissional, horários individuais e acompanhar a produtividade e comissões de cada um no painel.',
  },
  {
    q: 'Funciona para franquias ou múltiplas unidades?',
    a: 'Sim! O plano Enterprise foi criado especialmente para redes e franquias, com dashboard consolidado, comparativo entre unidades e gestão centralizada de toda a rede.',
  },
  {
    q: 'Como é feito o onboarding?',
    a: 'Em menos de 10 minutos. Você cadastra seu negócio, adiciona serviços, profissionais e pronto — sua página de agendamento online já está no ar. Nossa equipe também oferece suporte via WhatsApp para te ajudar.',
  },
  {
    q: 'Posso cancelar a qualquer momento?',
    a: 'Sim, sem multas ou burocracia. Você pode cancelar sua assinatura a qualquer momento direto no painel. Seus dados ficam disponíveis por 30 dias após o cancelamento.',
  },
  {
    q: 'O Fadely tem suporte em português?',
    a: 'Sim! Nossa equipe de suporte é 100% brasileira e atende via WhatsApp, chat e e-mail em horário comercial. Você nunca vai ficar na mão.',
  },
  {
    q: 'Meus dados ficam seguros?',
    a: 'Absolutamente. Utilizamos criptografia de ponta a ponta, backups automáticos diários e infraestrutura em nuvem com 99.9% de uptime. Seus dados e os de seus clientes estão sempre protegidos.',
  },
];

function FAQItem({ faq, isDark }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer"
      style={{
        background: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.9)',
        border: isDark
          ? open ? '1px solid rgba(79,142,247,0.25)' : '1px solid rgba(255,255,255,0.07)'
          : open ? '1px solid rgba(79,142,247,0.25)' : '1px solid rgba(0,0,0,0.06)',
      }}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between p-5 gap-4">
        <span className="text-sm font-medium" style={{ color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(8,10,20,0.8)' }}>
          {faq.q}
        </span>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
          style={{ background: open ? 'rgba(79,142,247,0.15)' : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
        >
          {open
            ? <Minus className="w-3.5 h-3.5 text-blue-400" />
            : <Plus className="w-3.5 h-3.5" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }} />
          }
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.48)' : 'rgba(0,0,0,0.52)' }}>
              {faq.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section id="faq" className={`py-28 transition-colors duration-500 ${isDark ? 'bg-[#060709]' : 'bg-[#F8F9FC]'}`}>
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-5" style={{
            background: isDark ? 'rgba(79,142,247,0.1)' : 'rgba(79,142,247,0.08)',
            color: '#4F8EF7',
            border: '1px solid rgba(79,142,247,0.2)',
          }}>
            FAQ
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(8,10,20,0.9)' }}>
            Perguntas frequentes
          </h2>
          <p className="text-lg" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)' }}>
            Tem mais dúvidas? Fale com nossa equipe pelo WhatsApp.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="space-y-3"
        >
          {faqs.map((faq, i) => (
            <FAQItem key={i} faq={faq} isDark={isDark} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}