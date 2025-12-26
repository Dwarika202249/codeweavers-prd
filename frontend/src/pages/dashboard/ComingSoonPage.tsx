import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';

interface ComingSoonPageProps {
  title: string;
}

export default function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center"
    >
      <div className="p-4 rounded-full bg-indigo-500/10 mb-4">
        <Construction className="w-12 h-12 text-indigo-400" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
      <p className="text-gray-400 max-w-md">
        This section is under development. Check back soon for updates!
      </p>
    </motion.div>
  );
}
