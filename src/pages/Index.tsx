
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Timer from '@/components/Timer';
import TimerControls from '@/components/TimerControls';
import TaskList from '@/components/TaskList';
import AddTask from '@/components/AddTask';
import HowToUse from '@/components/HowToUse';
import MusicPlayer from '@/components/MusicPlayer';
import useTimer from '@/hooks/useTimer';
import useTasks from '@/hooks/useTasks';
import { Heart } from 'lucide-react';
import { Toaster } from 'sonner';

const Index = () => {
  const [isLongPomodoro, setIsLongPomodoro] = useState(() => {
    try {
      return localStorage.getItem('isLongPomodoro') === 'true';
    } catch {
      return false;
    }
  });
  const [howToUseOpen, setHowToUseOpen] = useState(false);
  const [musicPlayerOpen, setMusicPlayerOpen] = useState(false);
  
  const {
    timerState,
    timerDurations,
    switchMode,
    startTimer,
    pauseTimer,
    resetTimer,
    formatTime
  } = useTimer(isLongPomodoro);
  
  const {
    tasks,
    activeTaskId,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    incrementTaskPomodoros,
    setActiveTask,
    clearCompletedTasks
  } = useTasks();

  // Set dark mode by default
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Save long pomodoro preference
  useEffect(() => {
    localStorage.setItem('isLongPomodoro', isLongPomodoro.toString());
  }, [isLongPomodoro]);

  // Update document title with timer
  useEffect(() => {
    let modePrefix = '';
    switch (timerState.mode) {
      case 'pomodoro':
        modePrefix = '🔴 Focus';
        break;
      case 'shortBreak':
        modePrefix = '🔵 Short Break';
        break;
      case 'longBreak':
        modePrefix = '🟢 Long Break';
        break;
    }
    document.title = `${modePrefix} (${formatTime(timerState.timeLeft)}) | ZenFocus`;
    return () => {
      document.title = 'ZenFocus - Pomodoro Timer';
    };
  }, [timerState.timeLeft, timerState.mode, formatTime]);

  // Add confirmation when leaving with active timer
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (timerState.isRunning) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your timer is still running.';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [timerState.isRunning]);
  
  const toggleLongPomodoro = () => {
    setIsLongPomodoro(!isLongPomodoro);
  };
  
  const containerVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 10
    },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  return (
    <div className="min-h-screen flocus-gradient dark:bg-gradient-to-b dark:from-[#150A30] dark:to-[#1A0A37] transition-colors">
      <div className="max-w-md mx-auto px-4 py-6 min-h-screen flex flex-col">
        <Header 
          openHowToUse={() => setHowToUseOpen(true)} 
          toggleLongPomodoro={toggleLongPomodoro} 
          isLongPomodoro={isLongPomodoro} 
        />
        
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible" 
          className="mt-6 flex-1 flex flex-col"
        >
          <motion.div variants={itemVariants}>
            <TimerControls currentMode={timerState.mode} switchMode={switchMode} />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Timer 
              timeString={formatTime(timerState.timeLeft)} 
              mode={timerState.mode} 
              isRunning={timerState.isRunning} 
              onStart={startTimer} 
              onPause={pauseTimer} 
              onReset={resetTimer} 
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            {activeTaskId && (
              <div className="mt-4 px-4 py-3 bg-white/10 dark:bg-white/5 rounded-lg backdrop-blur-sm">
                <h3 className="text-sm font-medium text-white/60">
                  CURRENT TASK
                </h3>
                <p className="font-medium mt-1 text-white">
                  {tasks.find(task => task.id === activeTaskId)?.title}
                </p>
              </div>
            )}
          </motion.div>
          
          <motion.div variants={itemVariants} className="mt-6 flex-1">
            <h2 className="text-lg font-semibold mb-3 text-white">Tasks</h2>
            <TaskList 
              tasks={tasks} 
              activeTaskId={activeTaskId} 
              onToggleComplete={toggleTaskCompletion} 
              onSetActive={setActiveTask} 
              onDelete={deleteTask} 
              onClearCompleted={clearCompletedTasks} 
            />
            <AddTask onAddTask={addTask} />
          </motion.div>
        </motion.div>
        
        <footer className="footer text-center">
          <p>
            2025 &copy; Made with <Heart className="h-3 w-3 inline-block footer-heart" /> by Faiz Intifada
          </p>
        </footer>
      </div>
      
      <HowToUse isOpen={howToUseOpen} onClose={() => setHowToUseOpen(false)} />
      <MusicPlayer isOpen={musicPlayerOpen} setIsOpen={setMusicPlayerOpen} />
      <Toaster position="bottom-center" />
    </div>
  );
};

export default Index;
