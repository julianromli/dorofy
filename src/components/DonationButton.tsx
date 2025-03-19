import React, { useState } from 'react';
import { Coffee, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const DonationButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDonate = () => {
    window.open('https://saweria.co/faizintifada', '_blank');
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-[10000] p-3 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white shadow-lg translate-y-[-120px]"
        aria-label="Support the author"
      >
        <Coffee className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-black/90 rounded-lg p-6 max-w-md w-full mx-4 border border-white/10 shadow-xl"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Coffee className="mr-2 h-5 w-5 text-primary" />
                  Support the Author
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-white/10"
                  aria-label="Close popup"
                >
                  <X className="h-5 w-5 text-white/70" />
                </button>
              </div>

              <p className="text-white/80 mb-6">
                If you find Dorofy helpful and want to support its development, consider buying me a coffee! Your support helps me continue improving and maintaining this app.
              </p>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDonate}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  <Coffee className="mr-2 h-4 w-4" />
                  Buy Me a Coffee
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DonationButton; 