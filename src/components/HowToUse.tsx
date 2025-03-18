
import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HowToUseProps {
  isOpen: boolean;
  onClose: () => void;
}

const HowToUse: React.FC<HowToUseProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-mono-900 rounded-lg shadow-lg"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-full text-mono-500 hover:text-mono-700 dark:text-mono-400 dark:hover:text-mono-200 hover:bg-mono-200 dark:hover:bg-mono-800 transition-colors"
              aria-label="Close how to use guide"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">How to Use ZenFocus</h2>
              
              <div className="space-y-6">
                <section>
                  <h3 className="text-lg font-semibold mb-2 text-pomodoro dark:text-pomodoro-light">The Pomodoro Technique</h3>
                  <p className="text-mono-700 dark:text-mono-300 mb-3">
                    The Pomodoro Technique is a time management method that uses a timer to break work into intervals, traditionally 25 minutes in length, separated by short breaks.
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-mono-700 dark:text-mono-300">
                    <li>Choose a task you'd like to get done</li>
                    <li>Set the timer for 25 or 50 minutes</li>
                    <li>Work on the task until the timer rings</li>
                    <li>Take a short break (5 or 10 minutes)</li>
                    <li>Every 4 pomodoros, take a longer break (15-30 minutes)</li>
                  </ol>
                </section>
                
                <section>
                  <h3 className="text-lg font-semibold mb-2 text-pomodoro dark:text-pomodoro-light">Using the Timer</h3>
                  <p className="text-mono-700 dark:text-mono-300 mb-3">
                    ZenFocus offers three timer modes:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-mono-700 dark:text-mono-300">
                    <li><span className="font-medium">Pomodoro</span>: 25 or 50 minutes of focused work</li>
                    <li><span className="font-medium">Short Break</span>: 5 or 10 minutes to rest</li>
                    <li><span className="font-medium">Long Break</span>: 15-30 minutes to recharge</li>
                  </ul>
                  <p className="mt-3 text-mono-700 dark:text-mono-300">
                    You can toggle between 25 and 50 minute pomodoro sessions using the toggle in the header.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-lg font-semibold mb-2 text-pomodoro dark:text-pomodoro-light">Managing Tasks</h3>
                  <p className="text-mono-700 dark:text-mono-300 mb-3">
                    Add tasks to keep track of your work:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-mono-700 dark:text-mono-300">
                    <li>Click "Add Task" to create a new task</li>
                    <li>Estimate how many pomodoros you'll need</li>
                    <li>Click on a task to make it active</li>
                    <li>Complete tasks by clicking the circle icon</li>
                    <li>Delete tasks using the menu or hover actions</li>
                  </ul>
                </section>
                
                <section>
                  <h3 className="text-lg font-semibold mb-2 text-pomodoro dark:text-pomodoro-light">Tips for Success</h3>
                  <ul className="list-disc list-inside space-y-2 text-mono-700 dark:text-mono-300">
                    <li>Break complex tasks into smaller, manageable pieces</li>
                    <li>Minimize distractions during pomodoro sessions</li>
                    <li>Use breaks to rest your mind, not to check email or social media</li>
                    <li>Be consistent and make it a daily habit</li>
                    <li>Adjust pomodoro length based on your focus capacity</li>
                  </ul>
                </section>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default HowToUse;
