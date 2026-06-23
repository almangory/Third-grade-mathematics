import { Unit, Lesson, UserProfile } from '../types';
import { curriculumUnits } from '../data/curriculumData';
import { Heart, Play, BookOpen, Star, Award, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  user: UserProfile;
  favorites: string[];
  toggleFavorite: (lessonId: string) => void;
  onSelectLesson: (lesson: Lesson, unit: Unit) => void;
  showOnlyFavorites?: boolean;
}

export default function Dashboard({
  user,
  favorites,
  toggleFavorite,
  onSelectLesson,
  showOnlyFavorites = false
}: DashboardProps) {
  // Filter units and lessons depending on whether we want to see all or only favorites
  const unitsToRender = curriculumUnits.map(unit => {
    if (showOnlyFavorites) {
      const favLessons = unit.lessons.filter(l => favorites.includes(l.id));
      return { ...unit, lessons: favLessons };
    }
    return unit;
  }).filter(unit => unit.lessons.length > 0);

  // Helper to calculate progress in a unit
  const calculateUnitProgress = (unit: Unit) => {
    const total = unit.lessons.length;
    const completed = unit.lessons.filter(l => user.completedLessons.includes(l.id)).length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 font-sans space-y-8" dir="rtl" id="app-dashboard">
      {/* Welcome Banner */}
      {!showOnlyFavorites && (
        <div className="relative overflow-hidden bg-gradient-to-l from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-6 text-white shadow-lg border-b-4 border-purple-600">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-2xl animate-bounce">🇸🇩</span>
                <span className="text-xs uppercase bg-white/20 text-white px-2.5 py-1 rounded-full font-bold">منهج جمهورية السودان</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black font-sans leading-tight">
                أهلاً بك يا بطل في نقلة للمناهج الإلكترونية! 🎒
              </h1>
              <p className="text-purple-100 text-sm font-medium mt-1">
                تعلم الرياضيات بطريقة تفاعلية ممتازة، باللعب والمرح والتحديات!
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
              <span className="text-3xl">🏆</span>
              <div>
                <p className="text-xs text-purple-200 font-bold">مستوى التقدم الكلي</p>
                <p className="text-lg font-black font-mono">
                  {user.completedLessons.length} / {curriculumUnits.reduce((acc, u) => acc + u.lessons.length, 0)} درساً منجزاً
                </p>
              </div>
            </div>
          </div>
          {/* Fun elements */}
          <div className="absolute -bottom-6 -left-6 text-9xl opacity-10 pointer-events-none select-none">📐</div>
          <div className="absolute -top-6 -right-6 text-9xl opacity-10 pointer-events-none select-none">✏️</div>
        </div>
      )}

      {/* Header for Only Favorites tab */}
      {showOnlyFavorites && (
        <div className="flex items-center gap-3 pb-2 border-b-4 border-red-200">
          <div className="p-3 bg-red-100 rounded-2xl text-red-500">
            <Heart className="w-7 h-7 fill-current" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-800 font-sans">دروسي المفضلة ❤️</h2>
            <p className="text-gray-500 text-xs font-bold mt-0.5">الدروس التي وضعتها في المفضلة لسهولة الوصول إليها وتكرارها</p>
          </div>
        </div>
      )}

      {/* Empty State for Favorites */}
      {showOnlyFavorites && unitsToRender.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border-2 border-dashed border-red-200 shadow-sm text-center">
          <span className="text-6xl mb-4">❤️</span>
          <h3 className="text-xl font-bold text-gray-700">لا يوجد أي درس مفضل حتى الآن!</h3>
          <p className="text-gray-400 text-sm mt-1.5 max-w-sm">
            تصفح المنهج الدراسي واضغط على زر القلب الصغير بجانب الدرس لإضافته هنا والاستمتاع به في أي وقت!
          </p>
        </div>
      )}

      {/* Curriculum Units Grid */}
      <div className="space-y-8">
        {unitsToRender.map((unit) => {
          const progress = calculateUnitProgress(unit);
          return (
            <section
              key={unit.id}
              className="bg-white rounded-3xl p-6 shadow-md border-b-4 border-gray-100 hover:shadow-lg transition-all"
              style={{ borderTop: `6px solid ${unit.color}` }}
            >
              {/* Unit Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-100">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs px-2.5 py-0.5 rounded-full font-black text-white"
                      style={{ backgroundColor: unit.color }}
                    >
                      {unit.id === 'unit1' ? 'الوحدة الأولى' :
                       unit.id === 'unit2' ? 'الوحدة الثانية' :
                       unit.id === 'unit3' ? 'الوحدة الثالثة' :
                       unit.id === 'unit4' ? 'الوحدة الرابعة' :
                       unit.id === 'unit5' ? 'الوحدة الخامسة' : 'الوحدة السادسة'}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-gray-800 font-sans">{unit.title}</h2>
                  <p className="text-gray-500 text-xs font-bold leading-relaxed">{unit.description}</p>
                </div>

                {/* Progress bar */}
                <div className="w-full sm:w-48 bg-gray-50 border border-gray-100 rounded-2xl p-3 flex flex-col justify-center">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-500 mb-1">
                    <span>نسبة الإنجاز</span>
                    <span className="font-mono text-gray-700">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: unit.color }}
                    />
                  </div>
                </div>
              </div>

              {/* Lessons Cards List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unit.lessons.map((lesson, idx) => {
                  const isFavorite = favorites.includes(lesson.id);
                  const isCompleted = user.completedLessons.includes(lesson.id);
                  return (
                    <motion.div
                      key={lesson.id}
                      whileHover={{ scale: 1.01 }}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between group bg-[#FFFDF6] ${
                        isCompleted ? 'border-green-200 bg-green-50/20' : 'border-gray-100 hover:border-amber-200'
                      }`}
                    >
                      <div>
                        {/* Upper row: Star badge & favorite toggle */}
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-black text-gray-400 font-mono">الدرس {idx + 1}</span>
                          <div className="flex items-center gap-1.5">
                            {isCompleted && (
                              <span className="flex items-center gap-0.5 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full font-bold">
                                <CheckCircle className="w-3.5 h-3.5" /> تم الإنجاز
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(lesson.id);
                              }}
                              className="p-1.5 rounded-full bg-white hover:bg-red-50 text-gray-300 hover:text-red-500 border border-gray-100 transition-colors cursor-pointer"
                            >
                              <Heart
                                className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Title & description */}
                        <h3 className="font-black text-base text-gray-800 group-hover:text-blue-600 transition-colors font-sans mb-1">
                          {lesson.title}
                        </h3>
                        <p className="text-gray-400 text-xs font-bold leading-relaxed mb-4">
                          {lesson.description}
                        </p>
                      </div>

                      {/* Launch Button */}
                      <button
                        onClick={() => onSelectLesson(lesson, unit)}
                        className={`w-full py-2.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm ${
                          isCompleted
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-amber-400 text-amber-950 hover:bg-amber-500 hover:shadow-md'
                        }`}
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>ابدأ الدرس التفاعلي</span>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
