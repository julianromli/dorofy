import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

import AddTask from '@/components/AddTask';
import BackgroundCustomizer from '@/components/BackgroundCustomizer';
import BackgroundRenderer from '@/components/BackgroundRenderer';
import DonationButton from '@/components/DonationButton';
import Header from '@/components/Header';
import HowToUse from '@/components/HowToUse';
import MusicPlayer from '@/components/MusicPlayer';
import TaskList from '@/components/TaskList';
import Timer from '@/components/Timer';
import TimerControls from '@/components/TimerControls';
import { GlassBadge, LiquidGlassSurface } from '@/components/glass';
import { ListTodo } from 'lucide-react';
import usePomodoroHistory from '@/hooks/usePomodoroHistory';
import useTasks from '@/hooks/useTasks';
import useTimer from '@/hooks/useTimer';

const AnalyticsSheetLazy = React.lazy(() => import('@/components/AnalyticsSheet'));

const containerVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const Index = () => {
  const [analyticsSheetOpen, setAnalyticsSheetOpen] = useState(false);
  const [isLongPomodoro, setIsLongPomodoro] = useState(() => {
    try {
      return localStorage.getItem('isLongPomodoro') === 'true';
    } catch {
      return false;
    }
  });
  const [howToUseOpen, setHowToUseOpen] = useState(false);
  const [musicPlayerOpen, setMusicPlayerOpen] = useState(false);
  const [backgroundCustomizerOpen, setBackgroundCustomizerOpen] = useState(false);
  const [taskBoardOpen, setTaskBoardOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const {
    tasks,
    activeTaskId,
    addTask,
    deleteTask,
    toggleTaskCompletion,
    incrementTaskPomodoros,
    setActiveTask,
    clearCompletedTasks,
    reorderTasks,
  } = useTasks();

  const { history: pomodoroHistory, addPomodoroSession } = usePomodoroHistory();

  function handlePomodoroComplete(duration: number) {
    if (activeTaskId) incrementTaskPomodoros(activeTaskId);
    addPomodoroSession({ duration, taskId: activeTaskId || undefined });
  }

  const {
    timerState,
    switchMode,
    startTimer,
    pauseTimer,
    resetTimer,
    formatTime,
  } = useTimer(isLongPomodoro, handlePomodoroComplete);

  useEffect(() => {
    localStorage.setItem('isLongPomodoro', isLongPomodoro.toString());
  }, [isLongPomodoro]);

  useEffect(() => {
    const prefix =
      timerState.mode === 'pomodoro'
        ? 'Focus'
        : timerState.mode === 'shortBreak'
          ? 'Short Break'
          : 'Long Break';

    document.title = `${prefix} (${formatTime(timerState.timeLeft)}) - Dorofy`;
    return () => {
      document.title = 'Dorofy - Pomodoro Timer';
    };
  }, [formatTime, timerState.mode, timerState.timeLeft]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!timerState.isRunning) return;
      event.preventDefault();
      event.returnValue = 'Are you sure you want to leave? Your timer is still running.';
      return event.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [timerState.isRunning]);

  useEffect(() => {
    const handleFullscreenChange = (event: CustomEvent) => {
      setIsFullscreen(event.detail.isFullscreen);
    };

    document.addEventListener('dorofyFullscreenChanged', handleFullscreenChange as EventListener);
    return () => document.removeEventListener('dorofyFullscreenChanged', handleFullscreenChange as EventListener);
  }, []);

  const activeTask = useMemo(() => tasks.find((task) => task.id === activeTaskId) ?? null, [activeTaskId, tasks]);
  const completedTasks = useMemo(() => tasks.filter((task) => task.completed).length, [tasks]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="default-background" />
      <div className="glass-orb left-[-8rem] top-[-6rem] h-72 w-72 bg-[rgba(150,194,255,0.45)]" />
      <div className="glass-orb bottom-[10%] right-[-5rem] h-80 w-80 bg-[rgba(255,209,231,0.38)]" />
      <div className="glass-orb left-[30%] top-[42%] h-64 w-64 bg-[rgba(165,242,224,0.28)]" />

      <BackgroundRenderer />

      <div className="app-content">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-4 md:px-6 md:py-6">
          <Header
            openHowToUse={() => setHowToUseOpen(true)}
            openAnalytics={() => setAnalyticsSheetOpen(true)}
            toggleLongPomodoro={() => setIsLongPomodoro((value) => !value)}
            isLongPomodoro={isLongPomodoro}
            isFullscreen={isFullscreen}
          />

          <main className="mt-6 flex-1 flex flex-col items-center">
            {!isFullscreen ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full mb-6"
              >
                <TimerControls currentMode={timerState.mode} switchMode={switchMode} />
              </motion.div>
            ) : null}

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={`w-full max-w-2xl mx-auto ${isFullscreen ? '' : ''}`}
            >
              <motion.section variants={itemVariants} className="space-y-6">

                <Timer
                  timeString={formatTime(timerState.timeLeft)}
                  mode={timerState.mode}
                  isRunning={timerState.isRunning}
                  onStart={startTimer}
                  onPause={pauseTimer}
                  onReset={resetTimer}
                />

                {!isFullscreen && activeTask ? (
                  <motion.div variants={itemVariants} className={`glass-mode-${timerState.mode}`}>
                    <LiquidGlassSurface variant="active" className="w-full" padding="22px">
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Active task</p>
                            <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">{activeTask.title}</h3>
                          </div>
                          <GlassBadge className="glass-mode-accent text-white">
                            {activeTask.completedPomodoros}/{activeTask.estimatedPomodoros}
                          </GlassBadge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Keep this task as the single focus anchor for the current timer block.
                        </p>
                      </div>
                    </LiquidGlassSurface>
                  </motion.div>
                ) : null}
              </motion.section>
            </motion.div>
          </main>

          {!isFullscreen ? (
            <footer className="footer mt-8 flex flex-wrap items-center justify-between gap-3 pt-4 text-sm">
              <p>Built for deliberate focus and lightweight daily rhythm.</p>
              <p>2026 © Faiz Intifada</p>
            </footer>
          ) : null}
        </div>
      </div>

      <HowToUse isOpen={howToUseOpen} onClose={() => setHowToUseOpen(false)} />
      <MusicPlayer isOpen={musicPlayerOpen} setIsOpen={setMusicPlayerOpen} />
      <BackgroundCustomizer isOpen={backgroundCustomizerOpen} setIsOpen={setBackgroundCustomizerOpen} />
      <div
        className={`fixed top-4 left-4 bottom-4 z-40 flex w-[min(34rem,calc(100vw-2rem))] flex-col rounded-[2rem] glass-sidebar transition-all duration-300 ease-in-out ${
          taskBoardOpen
            ? 'visible translate-x-0 opacity-100 pointer-events-auto'
            : 'invisible -translate-x-[110%] opacity-0 pointer-events-none'
        } ${isFullscreen ? 'hidden' : ''}`}
      >
        <div className="flex flex-col gap-2 border-b border-white/10 px-6 py-5 text-left">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Task board</h2>
              <p className="text-sm text-muted-foreground">Plan the next focus block</p>
            </div>
            <button
              onClick={() => setTaskBoardOpen(false)}
              className="glass-floating-button flex h-10 w-10 items-center justify-center rounded-full"
              aria-label="Close tasks"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <GlassBadge variant="outline">{tasks.length} total</GlassBadge>
            <GlassBadge variant="success">{completedTasks} done</GlassBadge>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <TaskList
            tasks={tasks}
            activeTaskId={activeTaskId}
            onToggleComplete={toggleTaskCompletion}
            onSetActive={setActiveTask}
            onDelete={deleteTask}
            onClearCompleted={clearCompletedTasks}
            onReorderTasks={reorderTasks}
          />
          <AddTask onAddTask={addTask} />
        </div>
      </div>
      <button
        onClick={() => setTaskBoardOpen(!taskBoardOpen)}
        className={`glass-floating-button fixed bottom-4 left-4 z-[100] flex h-12 w-12 translate-y-[-180px] items-center justify-center rounded-full ${isFullscreen ? 'hidden' : ''}`}
        aria-label={taskBoardOpen ? "Close tasks" : "Open tasks"}
      >
        <ListTodo className={`h-5 w-5 ${taskBoardOpen ? 'text-primary' : 'text-foreground'}`} />
      </button>

      <Suspense>
        {analyticsSheetOpen ? (
          <AnalyticsSheetLazy
            isOpen={analyticsSheetOpen}
            onClose={() => setAnalyticsSheetOpen(false)}
            tasks={tasks}
            pomodoroHistory={pomodoroHistory}
          />
        ) : null}
      </Suspense>
      <DonationButton />
    </div>
  );
};

export default Index;
