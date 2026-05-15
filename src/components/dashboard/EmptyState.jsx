import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6"
      >
        <Icon className="w-10 h-10 text-blue-400" />
      </motion.div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/40 text-sm max-w-sm mb-8">{description}</p>
      {actionLabel && (
        <Button onClick={onAction} className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-6 gap-2">
          <Plus className="w-4 h-4" />
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}