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
import { GlassBadge, GlassCard, LiquidGlassSurface } from '@/components/glass';
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

          <main className="mt-6 flex-1">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={`grid gap-6 ${isFullscreen ? '' : 'xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]'}`}
            >
              <motion.section variants={itemVariants} className="space-y-5">
                {!isFullscreen ? <TimerControls currentMode={timerState.mode} switchMode={switchMode} /> : null}

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

              {!isFullscreen ? (
                <motion.aside variants={itemVariants} className="space-y-5">
                  <GlassCard variant="elevated" className="space-y-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Task board</p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Plan the next focus block</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Drag unfinished tasks to reorder them, then set one as active before starting.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <GlassBadge variant="outline">{tasks.length} total</GlassBadge>
                        <GlassBadge variant="success">{completedTasks} done</GlassBadge>
                      </div>
                    </div>

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
                  </GlassCard>
                </motion.aside>
              ) : null}
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
