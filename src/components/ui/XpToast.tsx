import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useProgress } from "@/stores/progressStore";

export function XpToast() {
  const gain = useProgress((s) => s.lastXpGain);
  const combo = useProgress((s) => s.combo);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!gain) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 1600);
    return () => clearTimeout(t);
  }, [gain]);

  return (
    <AnimatePresence>
      {show && gain && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12 }}
          className="pointer-events-none fixed right-6 bottom-24 z-50 rounded-full border border-gold/40 bg-[#0d1322]/90 px-4 py-2 text-sm text-gold-2 shadow-[0_0_32px_rgba(212,165,116,0.25)] backdrop-blur-xl md:bottom-8"
        >
          +{gain.amount} XP{combo >= 3 ? ` · серия ×${combo}` : ""}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
