import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Timer from '@/components/Timer';
import TimerControls from '@/components/TimerControls';
import TaskList from '@/components/TaskList';
import AddTask from '@/components/AddTask';
import HowToUse from '@/components/HowToUse';
import useTimer from '@/hooks/useTimer';
import useTasks from '@/hooks/useTasks';
import { HelpCircle } from 'lucide-react';
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

  // Increment completed pomodoros when a pomodoro is completed
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
  return <div className="min-h-screen bg-gradient-to-b from-mono-100 to-white dark:from-mono-900 dark:to-mono-800 transition-colors">
      <div className="max-w-md mx-auto p-4">
        <Header openHowToUse={() => setHowToUseOpen(true)} toggleLongPomodoro={toggleLongPomodoro} isLongPomodoro={isLongPomodoro} />
        
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mt-4">
          <motion.div variants={itemVariants}>
            <TimerControls currentMode={timerState.mode} switchMode={switchMode} />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Timer timeString={formatTime(timerState.timeLeft)} mode={timerState.mode} isRunning={timerState.isRunning} onStart={startTimer} onPause={pauseTimer} onReset={resetTimer} />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            {activeTaskId && <div className="mt-4 px-4 py-3 bg-mono-100/80 dark:bg-mono-800/80 rounded-lg">
                <h3 className="text-sm font-medium text-mono-500 dark:text-mono-400">
                  CURRENT TASK
                </h3>
                <p className="font-medium mt-1">
                  {tasks.find(task => task.id === activeTaskId)?.title}
                </p>
              </div>}
          </motion.div>
          
          <motion.div variants={itemVariants} className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Tasks</h2>
            <TaskList tasks={tasks} activeTaskId={activeTaskId} onToggleComplete={toggleTaskCompletion} onSetActive={setActiveTask} onDelete={deleteTask} onClearCompleted={clearCompletedTasks} />
            <AddTask onAddTask={addTask} />
          </motion.div>
        </motion.div>
        
        
      </div>
      
      <HowToUse isOpen={howToUseOpen} onClose={() => setHowToUseOpen(false)} />
      <Toaster position="bottom-center" />
    </div>;
};
export default Index;