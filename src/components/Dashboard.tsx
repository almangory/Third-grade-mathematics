import { Unit, Lesson, UserProfile } from '../types';
import { curriculumUnits } from '../data/curriculumData';
import { Heart, Play, BookOpen, Star, Award, CheckCircle, Volume2, Compass, Search, Sparkles, X, Trophy, Gamepad2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef } from 'react';

interface DashboardProps {
  user: UserProfile;
  favorites: string[];
  toggleFavorite: (lessonId: string) => void;
  onSelectLesson: (lesson: Lesson, unit: Unit) => void;
  showOnlyFavorites?: boolean;
  onNavigateToTab?: (tab: string) => void;
  onStartQuiz?: (scope: { type: 'unit' | 'lesson' | 'all' | 'favorites'; unitId?: string; lessonId?: string; title: string }) => void;
}

export default function Dashboard({
  user,
  favorites,
  toggleFavorite,
  onSelectLesson,
  showOnlyFavorites = false,
  onNavigateToTab,
  onStartQuiz
}: DashboardProps) {
  // Active unit select modal
  const [activeUnitModal, setActiveUnitModal] = useState<Unit | null>(null);

  // Hassoun intelligent assistant state modals
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Storyboard slides for Sudan Math Adventure
  const storySlides = [
    {
      title: 'البداية في الخرطوم 🇸🇩',
      text: 'التقى بطلنا الصغير "الفاتح" بالطائر الذكي "حسون" مغرداً فوق النيل الأزرق. قال حسون: "يا الفاتح! مدينة الرياضيات السودانية بحاجة لعقلك الذكي لفك الأرقام السحرية وحل جداول الضرب في جزيرة توتي!"',
      emoji: '🦜🌅',
      image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: 'لغز المعداد عند خزان سنار 🌊',
      text: 'طارا معاً إلى خزان سنار العملاق، حيث توقفت المياه بسبب قفل رقمي! وجدوا لوحة خشبية مرسوم عليها خانات الآحاد والعشرات والمئات. بفضل مهارة تمثيل الأعداد، رتب الفاتح الرقم 7245 ففتحت البوابات وتدفقت المياه للمزارعين بالجزيرة!',
      emoji: '🧮💧',
      image: 'https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: 'بالونات الضرب في غابات الدندر 🎈🦁',
      text: 'في محمية الدندر، كانت هناك بالونات ملونة تحجب ضوء الشمس عن الحيوانات! مكتوب على كل بالون معادلة ضرب مثل (٧ × ٨). بفضل إجابات الفاتح السريعة وفرقعة البالونات، عاد النور للغابة والحيوانات سعيدة ومرحة!',
      emoji: '🦁🎈',
      image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: 'بيتزا الكسور في سوق أم درمان 🍕⛺',
      text: 'وصلا أخيراً إلى سوق أم درمان العريق، فوجدا خبازاً طيباً يواجه مشكلة في تقسيم الفطائر بالتساوي على الزبائن. قام الفاتح برسم الكسور وتحديد البسط والمقام، وحل الكسر المكافئ للنصف والربع وسط أهازيج وفرحة الجميع!',
      emoji: '🍕🎪',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600'
    }
  ];
  const [storySlideIdx, setStorySlideIdx] = useState(0);

  // Speech helper
  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      const text = `مرحباً يا بطل! أنا رفيقك حسون المساعد الذكي. هل أنت مستعد لتحدي الرياضيات الرائع اليوم؟ هيا بنا نقرأ الأعداد، ونفرقع بالونات الضرب، ونعد البيتزا اللذيذة، ونضبط عقارب الساعة في كتابنا الجميل! بالتوفيق والنجاح يا بطل!`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('الاستماع الصوتي غير مدعوم في متصفحك الحالي.');
    }
  };

  // Filter units and lessons depending on whether we want to see all or only favorites
  const unitsToRender = curriculumUnits.map(unit => {
    if (showOnlyFavorites) {
      const favLessons = unit.lessons.filter(l => favorites.includes(l.id));
      return { ...unit, lessons: favLessons };
    }
    return unit;
  }).filter(unit => unit.lessons.length > 0);

  // Search filter
  const searchResults = searchQuery ? curriculumUnits.flatMap(u => 
    u.lessons.filter(l => l.title.includes(searchQuery) || l.description.includes(searchQuery)).map(l => ({ lesson: l, unit: u }))
  ) : [];

  // Units cards metadata to match the design image
  const cardDesigns = [
    {
      id: 'unit1',
      badge: 'الوحدة الأولى',
      icon: '🧮',
      bgClass: 'bg-[#00A896]',
      buttonText: 'العب الآن 🎮',
      gameId: 'abacus',
      title: 'مغامرة العداد والأعداد',
      desc: 'قراءة الأعداد حتى 9999 وتمثيلها على العداد الخشبي وكتابتها بالكلمات'
    },
    {
      id: 'unit2',
      badge: 'الوحدة الثانية',
      icon: '🎈',
      bgClass: 'bg-[#FB923C]',
      buttonText: 'فرقع البالونات 🎮',
      gameId: 'race',
      title: 'بالونات جدول الضرب',
      desc: 'تحدى فرقعة البالونات الضرب في 7 و 8 و 9 وقنابل الصفر والواحد!'
    },
    {
      id: 'unit3',
      badge: 'الوحدة الثالثة',
      icon: '🍌',
      bgClass: 'bg-[#A855F7]',
      buttonText: 'اقسم الموز بالعدل 🎮',
      gameId: 'race', // fallback division race
      title: 'غابة القسمة العادلة',
      desc: 'قسمة الفاكهة وحل مسائل القسمة بباق وبدون باق من الكتاب'
    },
    {
      id: 'unit4',
      badge: 'الوحدة الرابعة',
      icon: '🍕',
      bgClass: 'bg-[#38BDF8]',
      buttonText: 'افتح مختبر الكسور 🎮',
      gameId: 'pizza',
      title: 'مختبر الكسور والبيتزا',
      desc: 'تلوين أجزاء البيتزا، وتحديد البسط والمقام والكسور المتكافئة'
    },
    {
      id: 'unit5',
      badge: 'الوحدة الخامسة',
      icon: '⏰',
      bgClass: 'bg-[#EC4899]',
      buttonText: 'اضبط الساعات 🎮',
      gameId: 'race',
      title: 'دوران الساعة والزمن',
      desc: 'تحريك شوكة الدقائق والساعات وقراءة الوقت بالعبارات الصحيحة'
    },
    {
      id: 'unit6',
      badge: 'الوحدة السادسة',
      icon: '📐',
      bgClass: 'bg-[#0D9488]',
      buttonText: 'ابدأ البناء الهندسي 🎮',
      gameId: 'race',
      title: 'أشكال الهندسة والخطوط',
      desc: 'اكتشف المثلث، المستطيل، المربع وحل تحدي التعاريف والمطابقة'
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 font-sans select-none" dir="rtl" id="app-dashboard">
      {/* 1. Header for Only Favorites tab */}
      {showOnlyFavorites ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b-4 border-red-200">
            <div className="p-3 bg-red-100 rounded-2xl text-red-500 animate-pulse">
              <Heart className="w-7 h-7 fill-current" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-800">دروسي المفضلة ❤️</h2>
              <p className="text-gray-500 text-xs font-bold mt-0.5">الدروس التي وضعتها في المفضلة لسهولة الوصول إليها وتكرارها</p>
            </div>
          </div>

          {unitsToRender.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border-2 border-dashed border-red-200 shadow-sm text-center">
              <span className="text-6xl mb-4">❤️</span>
              <h3 className="text-xl font-black text-gray-700">لا يوجد أي درس مفضل حتى الآن!</h3>
              <p className="text-gray-400 text-xs font-bold mt-2 max-w-sm">
                تصفح المنهج الدراسي واضغط على زر القلب الصغير بجانب الدرس لإضافته هنا والاستمتاع به في أي وقت!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {unitsToRender.flatMap(unit => 
                unit.lessons.map(lesson => (
                  <div key={lesson.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-black text-red-500 bg-red-50 px-3 py-1 rounded-full">{unit.title}</span>
                        <button
                          onClick={() => toggleFavorite(lesson.id)}
                          className="p-1.5 rounded-full bg-red-50 text-red-500 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                      <h3 className="font-black text-base text-gray-800 mb-1">{lesson.title}</h3>
                      <p className="text-gray-400 text-xs font-bold mb-4">{lesson.description}</p>
                    </div>
                    <button
                      onClick={() => onSelectLesson(lesson, unit)}
                      className="w-full py-2.5 bg-[#5D5FEF] hover:bg-[#4d4fdf] text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>دراسة الدرس الآن</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        /* 2. MAIN "مغامرات مدينة الرياضيات SD" VISUAL DASHBOARD */
        <div className="space-y-6">
          {/* Top Banner exactly from design */}
          <div className="bg-[#5D5FEF] rounded-3xl p-4 md:p-5 flex flex-col md:flex-row justify-between items-center text-white border-b-4 border-yellow-400 shadow-md gap-4 relative overflow-hidden">
            <div className="flex items-center gap-4 z-10 w-full md:w-auto justify-start">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 rounded-full flex items-center justify-center text-3xl shadow-inner animate-bounce">
                🎒
              </div>
              <div className="text-right">
                <p className="text-yellow-300 text-xs font-black tracking-wider uppercase">جمهورية السودان • وزارة التربية والتعليم - تلميذ الصف ٣</p>
                <h1 className="text-xl md:text-2xl font-black font-sans leading-none mt-1">مغامرات مدينة الرياضيات SD</h1>
              </div>
            </div>

            {/* Stars badge left */}
            <div className="bg-white text-yellow-600 border-2 border-yellow-400 px-5 py-2 rounded-full flex items-center gap-2 font-black shadow-sm z-10 text-sm self-end md:self-center">
              <span>⭐</span>
              <span className="font-mono">{user.points} نجمة</span>
            </div>

            {/* Decorative backgrounds */}
            <div className="absolute right-1/3 -bottom-10 text-8xl text-white/5 font-bold pointer-events-none">+</div>
            <div className="absolute left-10 -top-6 text-7xl text-white/5 font-bold pointer-events-none">÷</div>
          </div>

          {/* Main Grid: Left cards (6 units) & Right sidebar (Hassoun) */}
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Left Panels: 6 Units Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              {cardDesigns.map((card) => (
                <div
                  key={card.id}
                  onClick={() => {
                    const matchedUnit = curriculumUnits.find(u => u.id === card.id);
                    if (matchedUnit) setActiveUnitModal(matchedUnit);
                  }}
                  className={`${card.bgClass} text-white rounded-[2rem] p-6 flex flex-col justify-between min-h-[220px] shadow-lg cursor-pointer transform hover:-translate-y-1 transition-all hover:shadow-xl border-b-4 border-black/20 group`}
                >
                  <div className="space-y-3">
                    {/* Badge */}
                    <span className="bg-white/20 text-white text-[10px] px-3.5 py-1 rounded-full font-black self-start inline-block">
                      {card.badge}
                    </span>

                    {/* Header: Title + Icon */}
                    <div className="flex justify-between items-start">
                      <h3 className="font-black text-lg md:text-xl font-sans leading-tight group-hover:underline">{card.title}</h3>
                      <span className="text-4xl filter drop-shadow-md">{card.icon}</span>
                    </div>

                    {/* Description */}
                    <p className="text-white/80 text-xs font-bold leading-relaxed">{card.desc}</p>
                  </div>

                  {/* Play Button */}
                  <button className="bg-white text-gray-800 font-black py-2.5 px-4 rounded-xl text-xs w-full mt-4 text-center group-hover:scale-102 transition-transform shadow-md flex items-center justify-center gap-1.5">
                    <span>{card.buttonText}</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Right Panel: Mascot Smart Assistant (حسون) */}
            <div className="w-full lg:w-80 shrink-0">
              <div className="border-4 border-pink-400 bg-white rounded-[2rem] p-6 text-center shadow-lg relative flex flex-col items-center justify-between h-full gap-5">
                {/* Float green star badge */}
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-green-400 text-white flex items-center justify-center rounded-2xl shadow-lg border-2 border-white rotate-12 animate-pulse text-xs font-black">
                  ٢٠٣٠
                </div>

                {/* Bird Circle Mascot */}
                <div className="w-28 h-28 rounded-full border-4 border-dashed border-[#5D5FEF] flex items-center justify-center bg-indigo-50/50 relative animate-bounce duration-1000">
                  <span className="text-5xl">🦜</span>
                  <div className="absolute -bottom-1 bg-yellow-400 text-black px-2 py-0.5 rounded-full text-[9px] font-black shadow-sm">حسون المساعد</div>
                </div>

                {/* Text prompt */}
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-[#5D5FEF]">مرحباً يا بطل! 👋</h3>
                  <p className="text-gray-600 text-xs font-bold leading-relaxed">
                    أنا رفيقك "حسون المساعد الذكي"! هل أنت مستعد للعب واكتشاف دروس الأرقام، وجداول الضرب، وباقي القسمة، والبيتزا للكسور وساعات الزمن في كتابنا الجميل؟
                  </p>
                </div>

                {/* Vertical actions block */}
                <div className="w-full space-y-2.5">
                  <button
                    onClick={handleSpeak}
                    className={`w-full py-2.5 px-4 rounded-2xl font-black text-xs text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                      isSpeaking ? 'bg-red-500 animate-pulse' : 'bg-pink-500 hover:bg-pink-600'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{isSpeaking ? 'إيقاف الاستماع ⏹️' : 'استمع لترحيب حسون 🔊'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setStorySlideIdx(0);
                      setShowStoryModal(true);
                    }}
                    className="w-full py-2.5 px-4 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>قصة المنهج التفاعلية المصورة 📖</span>
                  </button>

                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setShowSearchModal(true);
                    }}
                    className="w-full py-2.5 px-4 bg-[#38BDF8] hover:bg-[#0EA5E9] text-white rounded-2xl font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>ابحث بداخل كتاب حسون الذكي 🔍</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onStartQuiz) {
                        onStartQuiz({ type: 'all', title: 'صالة الامتحانات والمسابقات الكبرى • كامل المنهج' });
                      }
                    }}
                    className="w-full py-3 px-4 bg-[#EAB308] hover:bg-[#CA8A04] text-amber-950 rounded-2xl font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>صالة الامتحانات والاختبارات الكبرى 🏆</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL A: Illustrated Sudanese Math Storybook */}
      <AnimatePresence>
        {showStoryModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] overflow-hidden max-w-lg w-full shadow-2xl border-4 border-purple-400 relative flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowStoryModal(false)}
                className="absolute top-4 left-4 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black cursor-pointer z-20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Cover Image or Cartoon */}
              <div className="relative h-48 bg-gradient-to-br from-purple-100 to-amber-100 flex items-center justify-center overflow-hidden">
                <img
                  src={storySlides[storySlideIdx].image}
                  alt={storySlides[storySlideIdx].title}
                  className="w-full h-full object-cover opacity-80"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-5">
                  <span className="text-4xl absolute top-4 right-4 animate-bounce">{storySlides[storySlideIdx].emoji}</span>
                  <h4 className="text-white font-black text-lg md:text-xl">{storySlides[storySlideIdx].title}</h4>
                </div>
              </div>

              {/* Story Description Text */}
              <div className="p-6 md:p-8 space-y-4 text-right flex-1">
                <p className="text-gray-700 text-sm md:text-base font-black leading-relaxed">
                  {storySlides[storySlideIdx].text}
                </p>
              </div>

              {/* Controller Pagination Buttons */}
              <div className="border-t border-gray-100 p-4 flex justify-between bg-gray-50 items-center">
                <button
                  onClick={() => {
                    if (storySlideIdx > 0) {
                      setStorySlideIdx(storySlideIdx - 1);
                    } else {
                      setShowStoryModal(false);
                    }
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-xl text-xs font-black cursor-pointer transition-colors"
                >
                  {storySlideIdx === 0 ? 'إغلاق' : 'السابق'}
                </button>
                
                {/* Dots indicators */}
                <div className="flex gap-1.5">
                  {storySlides.map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-2 rounded-full transition-all ${
                        idx === storySlideIdx ? 'w-4 bg-purple-600' : 'w-2 bg-purple-200'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => {
                    if (storySlideIdx < storySlides.length - 1) {
                      setStorySlideIdx(storySlideIdx + 1);
                    } else {
                      setShowStoryModal(false);
                    }
                  }}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl text-xs cursor-pointer transition-colors"
                >
                  {storySlideIdx === storySlides.length - 1 ? 'مفهوم! هيا نلعب 🎉' : 'التالي'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL B: Search Inside Curriculum Book (حسون الباحث الذكي) */}
      <AnimatePresence>
        {showSearchModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] p-6 max-w-md w-full shadow-2xl border-4 border-[#38BDF8] flex flex-col relative h-[450px]"
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔍</span>
                  <h3 className="text-base font-black text-gray-800">مكتبة البحث الذكي لحسون</h3>
                </div>
                <button
                  onClick={() => setShowSearchModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Input field */}
              <div className="my-4 relative">
                <input
                  type="text"
                  placeholder="مثال: ضرب، كسر، ساعة، آحاد..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-3 pr-10 pl-4 bg-gray-50 border-2 border-gray-200 focus:border-[#38BDF8] rounded-2xl outline-none text-xs font-bold text-right"
                  autoFocus
                />
                <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
              </div>

              {/* Search list */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {searchQuery ? (
                  searchResults.length > 0 ? (
                    searchResults.map(({ lesson, unit }) => (
                      <div
                        key={lesson.id}
                        onClick={() => {
                          onSelectLesson(lesson, unit);
                          setShowSearchModal(false);
                        }}
                        className="p-3 bg-gray-50 hover:bg-[#38BDF8]/10 border border-gray-100 hover:border-[#38BDF8]/40 rounded-xl cursor-pointer text-right space-y-1 transition-colors"
                      >
                        <span className="text-[10px] font-black text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-0.5 rounded-full inline-block">{unit.title}</span>
                        <h4 className="font-black text-xs text-gray-800">{lesson.title}</h4>
                        <p className="text-gray-400 text-[10px] font-bold line-clamp-1">{lesson.description}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-gray-400 text-xs font-bold">
                      لا توجد نتائج تطابق بحثك يا بطل! 🏜️
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-10 text-gray-400 space-y-3">
                    <span className="text-4xl">📚</span>
                    <p className="text-xs font-bold max-w-xs">
                      أدخل كلمة مفتاحية للبحث عن أي درس في المنهج لتصفحه وبدء تعلمه فوراً!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL C: Beautiful Unit Lessons Selection (أبرز الدروس والألعاب) */}
      <AnimatePresence>
        {activeUnitModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-[2rem] overflow-hidden max-w-xl w-full shadow-2xl border-4 flex flex-col relative max-h-[90vh]"
              style={{ borderColor: activeUnitModal.color }}
            >
              {/* Header banner */}
              <div className="p-6 text-white text-right relative" style={{ backgroundColor: activeUnitModal.color }}>
                <button
                  onClick={() => setActiveUnitModal(null)}
                  className="absolute top-4 left-4 bg-black/20 hover:bg-black/40 text-white w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="space-y-1.5">
                  <span className="text-[10px] bg-white/20 text-white px-3 py-0.5 rounded-full font-black uppercase tracking-wider inline-block">
                    {activeUnitModal.id === 'unit1' ? 'الوحدة الأولى' :
                     activeUnitModal.id === 'unit2' ? 'الوحدة الثانية' :
                     activeUnitModal.id === 'unit3' ? 'الوحدة الثالثة' :
                     activeUnitModal.id === 'unit4' ? 'الوحدة الرابعة' :
                     activeUnitModal.id === 'unit5' ? 'الوحدة الخامسة' : 'الوحدة السادسة'}
                  </span>
                  <h3 className="font-black text-xl leading-tight font-sans">{activeUnitModal.title}</h3>
                  <p className="text-white/80 text-xs font-medium leading-relaxed">{activeUnitModal.description}</p>
                </div>
              </div>

              {/* Content lists */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1 max-h-[50vh]">
                
                {/* Launch specific interactive game shortcut if available */}
                {onNavigateToTab && (
                  <div className="bg-amber-50 border-2 border-dashed border-amber-300 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3 shadow-inner">
                    <div className="flex items-center gap-2.5 text-right">
                      <span className="text-3xl animate-pulse">🎮</span>
                      <div>
                        <h4 className="font-black text-amber-900 text-xs">التحدي واللعبة التفاعلية لهذه الوحدة!</h4>
                        <p className="text-amber-700 text-[10px] font-bold mt-0.5">العب الآن واربح نقاطاً إضافية في صالة الألعاب</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setActiveUnitModal(null);
                        onNavigateToTab('games');
                      }}
                      className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-transform hover:scale-103"
                    >
                      <Gamepad2 className="w-3.5 h-3.5" />
                      <span>انطلق للألعاب التفاعلية 🚀</span>
                    </button>
                  </div>
                )}

                <div className="space-y-3 text-right">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">الدروس المتوفرة بالوحدة:</h4>
                  <div className="space-y-3">
                    {activeUnitModal.lessons.map((lesson, idx) => {
                      const isFav = favorites.includes(lesson.id);
                      const isComp = user.completedLessons.includes(lesson.id);
                      return (
                        <div
                          key={lesson.id}
                          onClick={() => {
                            onSelectLesson(lesson, activeUnitModal);
                            setActiveUnitModal(null);
                          }}
                          className={`p-4 rounded-2xl border-2 hover:border-gray-300 transition-all cursor-pointer flex justify-between items-center group ${
                            isComp ? 'bg-green-50/20 border-green-200' : 'bg-gray-50/50 border-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 bg-white text-gray-700 font-mono text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                              {idx + 1}
                            </span>
                            <div>
                              <h5 className="font-black text-xs text-gray-800 group-hover:text-[#5D5FEF] transition-colors">{lesson.title}</h5>
                              <p className="text-gray-400 text-[10px] font-bold line-clamp-1">{lesson.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isComp && (
                              <span className="text-[10px] text-green-600 bg-green-100 px-2.5 py-0.5 rounded-full font-black">مكتمل ✅</span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(lesson.id);
                              }}
                              className="p-1.5 bg-white rounded-full border border-gray-100 text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                            </button>
                            <span className="p-1.5 bg-white text-gray-700 rounded-lg group-hover:bg-[#5D5FEF] group-hover:text-white transition-colors">
                              <ArrowLeft className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Bottom footer button */}
              <div className="border-t border-gray-100 p-4 bg-gray-50 flex justify-end">
                <button
                  onClick={() => setActiveUnitModal(null)}
                  className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-xl text-xs font-black cursor-pointer transition-colors text-gray-800"
                >
                  إغلاق التصفح
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
