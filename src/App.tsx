import { useState, useEffect } from 'react';
import { UserProfile, QuizResult, Lesson, Unit } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LessonView from './components/LessonView';
import WorksheetGenerator from './components/WorksheetGenerator';
import GameCenter from './components/GameCenter';
import ProgressAndBadges from './components/ProgressAndBadges';
import InteractiveQuiz from './components/InteractiveQuiz';
import { Sparkles, Calendar, Settings, Volume2, Gamepad2, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Hardcoded Badge Database definition
const ALL_BADGES = [
  { id: 'b1', title: 'وسام بطل المعداد 🧮', description: 'يُمنح عند قراءة وكتابة الأعداد ضمن 4 خانات بدقة.', icon: '🧮', color: 'bg-amber-100 border-amber-300 text-amber-800' },
  { id: 'b2', title: 'فارس جدول الضرب ⚔️', description: 'يُمنح عند إتقان جداول ضرب الأعداد 7 و 8 و 9 كاملة.', icon: '⚔️', color: 'bg-blue-100 border-blue-300 text-blue-800' },
  { id: 'b3', title: 'ملك الكسور 🍕', description: 'يُمنح عند إتقان جمع وطرح ومقارنة الكسور متساوية المقامات.', icon: '🍕', color: 'bg-pink-100 border-pink-300 text-pink-800' },
  { id: 'b4', title: 'سيد الوقت والقياس ⏱️', description: 'يُمنح عند تمثيل عقارب الساعات والدقائق وفهم أجزائها.', icon: '⏱️', color: 'bg-orange-100 border-orange-300 text-orange-800' },
  { id: 'b5', title: 'مهندس المستقبل 📐', description: 'يُمنح عند قياس أطوال القطع وتحديد خصائص المثلث والمربع.', icon: '📐', color: 'bg-purple-100 border-purple-300 text-purple-800' }
];

export default function App() {
  // App navigation tab
  const [activeTab, setActiveTab] = useState<string>('curriculum');
  const [selectedLesson, setSelectedLesson] = useState<{ lesson: Lesson; unit: Unit } | null>(null);
  const [activeQuizScope, setActiveQuizScope] = useState<{ type: 'lesson' | 'unit' | 'all'; id?: string; title: string } | null>(null);

  // Watermark global control
  const [isWatermarkRemoved, setIsWatermarkRemoved] = useState<boolean>(false);

  // Local storage profile state
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('sudan_math_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback below
      }
    }
    return {
      name: 'بطل الرياضيات الصغير',
      avatar: '🦁',
      points: 120,
      completedLessons: [],
      completedUnits: [],
      badges: [],
      favorites: []
    };
  });

  const [reports, setReports] = useState<QuizResult[]>(() => {
    const saved = localStorage.getItem('sudan_math_quiz_reports');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Save changes to local storage
  useEffect(() => {
    localStorage.setItem('sudan_math_user_profile', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('sudan_math_quiz_reports', JSON.stringify(reports));
  }, [reports]);

  // Prompt before leaving or closing
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'هل أنت متأكد من رغبتك في مغادرة برنامج المناهج الإلكترونية؟';
      return 'هل أنت متأكد من رغبتك في مغادرة برنامج المناهج الإلكترونية؟';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Support mobile hardware/browser back button inside applet
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (selectedLesson || activeQuizScope) {
        // Go back inside the app instead of closing/exiting!
        setSelectedLesson(null);
        setActiveQuizScope(null);
        // Prevent default browser transition by pushing a dummy state
        window.history.pushState(null, '', '');
      }
    };

    // Initially push state so there is something to pop
    window.history.pushState(null, '', '');

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [selectedLesson, activeQuizScope]);

  // Handler to toggle favorites
  const handleToggleFavorite = (lessonId: string) => {
    setUser(prev => {
      const isFav = prev.favorites.includes(lessonId);
      const updated = isFav
        ? prev.favorites.filter(id => id !== lessonId)
        : [...prev.favorites, lessonId];
      return {
        ...prev,
        favorites: updated
      };
    });
  };

  // Handler to complete a lesson & automatically award points + badges
  const handleCompleteLesson = (lessonId: string) => {
    const isAlreadyCompleted = user.completedLessons.includes(lessonId);
    let updatedCompleted = [...user.completedLessons];
    let pointsAwarded = 0;

    if (isAlreadyCompleted) {
      // Toggle off
      updatedCompleted = updatedCompleted.filter(id => id !== lessonId);
    } else {
      updatedCompleted.push(lessonId);
      pointsAwarded = 50; // award 50 points
    }

    setUser(prev => {
      const newPoints = Math.max(0, prev.points + pointsAwarded);
      // Auto badge evaluation
      const newBadges = [...prev.badges];

      // Evaluation rules:
      // Unit 1 completed -> get Badge 1
      const u1CompletedAll = ['u1-l1', 'u1-l2', 'u1-l3', 'u1-l4'].every(id => newBeads(newBeadsList(newBeadsWith(newBeadsId(newBeadsList(targetIds(id, prev.completedLessons, lessonId, isAlreadyCompleted)))))));
      
      const badgeRules = [
        { id: 'b1', lessons: ['u1-l1', 'u1-l2', 'u1-l3', 'u1-l4'] },
        { id: 'b2', lessons: ['u2-l1', 'u2-l2', 'u2-l3', 'u2-l4', 'u2-l5', 'u2-l6', 'u2-l7'] },
        { id: 'b3', lessons: ['u3-l1', 'u3-l2', 'u3-l3', 'u3-l4'] },
        { id: 'b4', lessons: ['u4-l1', 'u4-l2', 'u4-l3'] },
        { id: 'b5', lessons: ['u5-l1', 'u5-l2'] },
        { id: 'b6', lessons: ['u6-l1', 'u6-l2'] }
      ];

      badgeRules.forEach(rule => {
        const isEligible = rule.lessons.every(id => updatedCompleted.includes(id));
        const alreadyHas = newBadges.some(b => b.id === rule.id);
        if (isEligible && !alreadyHas) {
          const dbBadge = ALL_BADGES.find(b => b.id === rule.id);
          if (dbBadge) {
            newBadges.push({
              id: dbBadge.id,
              title: dbBadge.title,
              description: dbBadge.description,
              icon: dbBadge.icon.split(' ')[1] || '🏅',
              color: dbBadge.color
            });
          }
        }
      });

      return {
        ...prev,
        points: newPoints,
        completedLessons: updatedCompleted,
        badges: newBadges
      };
    });
  };

  const newBeads = (val: boolean) => val;
  const newBeadsList = (val: boolean) => val;
  const newBeadsWith = (val: boolean) => val;
  const newBeadsId = (val: boolean) => val;
  const newBeadsList2 = (val: boolean) => val;
  const targetIds = (id: string, completed: string[], lessonId: string, isRemoved: boolean) => {
    const list = isRemoved ? completed.filter(x => x !== lessonId) : [...completed, lessonId];
    return list.includes(id);
  };

  // Award direct points (e.g. from quiz or game)
  const handleAwardPoints = (points: number) => {
    setUser(prev => ({
      ...prev,
      points: prev.points + points
    }));
  };

  // Watermark Unlock Password Action
  const handleUnlockWatermark = (password: string) => {
    if (password === '20302060') {
      setIsWatermarkRemoved(true);
      return true;
    }
    return false;
  };

  // Save completed quiz report
  const handleSaveReport = (result: QuizResult) => {
    setReports(prev => [result, ...prev]);
  };

  // Clear all past reports
  const handleClearReports = () => {
    setReports([]);
  };

  return (
    <div className="w-full h-screen bg-[#FFFBEB] flex flex-col lg:flex-row-reverse font-sans overflow-hidden text-right" dir="rtl">
      {/* Sidebar navigation */}
      <Sidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedLesson(null);
          setActiveQuizScope(null);
        }}
        isWatermarkRemoved={isWatermarkRemoved}
        onUnlockWatermark={handleUnlockWatermark}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b-2 border-yellow-100 p-5 flex justify-between items-center shrink-0">
          <div className="text-right">
            <h1 className="text-lg font-black text-gray-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500 animate-spin" />
              <span>منصة نقلة للمناهج الإلكترونية 🇸🇩</span>
            </h1>
            <p className="text-[11px] text-gray-400 font-bold mt-0.5">
              مادة الرياضيات التفاعلية الشاملة • الصف الثالث الابتدائي
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-gray-500 font-sans">
            <div className="bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-xl flex items-center gap-1">
              <span className="text-yellow-600">⭐</span>
              <span className="text-yellow-800 font-mono font-black">{user.points} نقطة</span>
            </div>
          </div>
        </header>

        {/* Dynamic Inner Tab Area */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {activeQuizScope ? (
            /* ACTIVE QUIZ SCREEN OVERLAY */
            <InteractiveQuiz
              user={user}
              scope={activeQuizScope}
              onClose={() => setActiveQuizScope(null)}
              onSaveReport={handleSaveReport}
              onAwardPoints={handleAwardPoints}
            />
          ) : selectedLesson ? (
            /* ACTIVE LESSON DETAILS VIEW */
            <LessonView
              lesson={selectedLesson.lesson}
              unit={selectedLesson.unit}
              user={user}
              favorites={user.favorites}
              toggleFavorite={handleToggleFavorite}
              onBack={() => setSelectedLesson(null)}
              onComplete={handleCompleteLesson}
              onStartQuiz={setActiveQuizScope}
            />
          ) : (
            /* MAIN TABS VIEWS SWITCHER */
            <AnimatePresence mode="wait">
              {activeTab === 'curriculum' && (
                <Dashboard
                  user={user}
                  favorites={user.favorites}
                  toggleFavorite={handleToggleFavorite}
                  onSelectLesson={(lesson, unit) => setSelectedLesson({ lesson, unit })}
                />
              )}

              {activeTab === 'worksheets' && (
                <WorksheetGenerator
                  user={user}
                  favorites={user.favorites}
                  isWatermarkRemoved={isWatermarkRemoved}
                  onUnlockWatermark={handleUnlockWatermark}
                />
              )}

              {activeTab === 'games' && (
                <GameCenter
                  user={user}
                  onAwardPoints={handleAwardPoints}
                />
              )}

              {activeTab === 'progress' && (
                <ProgressAndBadges
                  user={user}
                  reports={reports}
                  onClearReports={handleClearReports}
                />
              )}

              {activeTab === 'favorites' && (
                <Dashboard
                  user={user}
                  favorites={user.favorites}
                  toggleFavorite={handleToggleFavorite}
                  onSelectLesson={(lesson, unit) => setSelectedLesson({ lesson, unit })}
                  showOnlyFavorites={true}
                />
              )}
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}
