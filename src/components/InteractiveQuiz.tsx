import { Question, UserProfile, QuizResult } from '../types';
import { questionPool } from '../data/curriculumData';
import { Sparkles, CheckCircle, XCircle, Award, Star, AlertCircle, Share2, Clipboard, Printer, RefreshCw, BookOpen, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

// Comprehensive pool of Sudanese real-world word problems
const realWorldQuestions: Question[] = [
  // Unit 1 Easy
  {
    id: 'rw-u1-e1',
    type: 'choice',
    text: 'اشترى البطل أحمد 15 حبة بلح لذيذة ومغذية من دكان الحلة، ثم أعطاه عمه 12 حبة بلح أخرى. كم بلحة مع أحمد الآن؟',
    options: ['25 بلحة', '27 بلحة', '30 بلحة', '17 بلحة'],
    correctAnswer: '27 بلحة',
    unitId: 'unit1',
    lessonId: 'u1-l3',
    score: 5
  },
  {
    id: 'rw-u1-e2',
    type: 'fill',
    text: 'جمع محمد 45 جنيهاً في حصالته الصغيرة، ثم اشترى قلم تلوين جميل بـ 20 جنيهاً. كم جنيهاً تبقى معه في الحصالة؟',
    correctAnswer: '25',
    unitId: 'unit1',
    lessonId: 'u1-l4',
    score: 5
  },
  // Unit 1 Medium
  {
    id: 'rw-u1-m1',
    type: 'choice',
    text: 'أرسل المزارع التوم شاحنتين محملتين بالبطيخ الطازج من مزارع النيل الأبيض. الأولى فيها 1250 بطيخة، والثانية فيها 1130 بطيخة. ما مجموع البطيخ في الشاحنتين؟',
    options: ['2380 بطيخة', '2480 بطيخة', '2250 بطيخة', '2500 بطيخة'],
    correctAnswer: '2380 بطيخة',
    unitId: 'unit1',
    lessonId: 'u1-l3',
    score: 5
  },
  {
    id: 'rw-u1-m2',
    type: 'fill',
    text: 'عند بائعة الشاي فاطمة في سوق الخرطوم 2540 كوباً ورقياً، استهلكت منها 1310 أكواب في الأسبوع الأول. كم كوباً بقي مع فاطمة؟',
    correctAnswer: '1230',
    unitId: 'unit1',
    lessonId: 'u1-l4',
    score: 5
  },
  // Unit 1 Hard
  {
    id: 'rw-u1-h1',
    type: 'fill',
    text: 'قطف المزارع عثمان من بستانه في الجزيرة 4850 ثمرة مانجو ناضجة. باع منها للتاجر أحمد 2685 ثمرة. كم ثمرة مانجو بقيت في بستان عثمان؟',
    correctAnswer: '2165',
    unitId: 'unit1',
    lessonId: 'u1-l4',
    score: 5
  },
  {
    id: 'rw-u1-h2',
    type: 'fill',
    text: 'صنع خباز القرية في الصباح 3475 رغيفاً بلادياً من القمح. وفي المساء صنع 2588 رغيفاً آخر. كم رغيفاً صنعه خباز القرية في هذا اليوم؟',
    correctAnswer: '6063',
    unitId: 'unit1',
    lessonId: 'u1-l3',
    score: 5
  },

  // Unit 2 Easy
  {
    id: 'rw-u2-e1',
    type: 'boolean',
    text: 'إذا كانت كل شجرة مانجو في بستان عثمان بها 7 ثمرات، فكم ثمرة في شجرة واحدة؟ الناتج هو 7 ثمرات.',
    correctAnswer: true,
    unitId: 'unit2',
    lessonId: 'u2-l1',
    score: 5
  },
  {
    id: 'rw-u2-e2',
    type: 'fill',
    text: 'اشترى ياسر 5 قطع حلوى سودانية (قرقوش)، ثمن القطعة الواحدة 10 جنيهات. كم جنيهاً دفع ياسر للبائع؟',
    correctAnswer: '50',
    unitId: 'unit2',
    lessonId: 'u2-l5',
    score: 5
  },
  // Unit 2 Medium
  {
    id: 'rw-u2-m1',
    type: 'choice',
    text: 'يقوم عمال مصنع النسيج في الحصاحيصا بتعبئة الملابس في صناديق كرتونية. إذا كان كل صندوق يتسع لـ 8 قمصان، فكم قميصاً نعبئها في 7 صناديق؟',
    options: ['56 قميصاً', '48 قميصاً', '64 قميصاً', '42 قميصاً'],
    correctAnswer: '56 قميصاً',
    unitId: 'unit2',
    lessonId: 'u2-l3',
    score: 5
  },
  {
    id: 'rw-u2-m2',
    type: 'fill',
    text: 'تضع أمي 7 قطع من بسكويت الشاي في كل طبق صغير تقدمه للضيوف. إذا قدمت 9 أطباق، فكم قطعة بسكويت قدمت للضيوف؟',
    correctAnswer: '63',
    unitId: 'unit2',
    lessonId: 'u2-l2',
    score: 5
  },
  // Unit 2 Hard
  {
    id: 'rw-u2-h1',
    type: 'fill',
    text: 'في مدرسة وادي سيدنا، توجد 24 منضدة خشبية في كل فصل دراسي. إذا كانت المدرسة تحتوي على 9 فصول دراسية، فكم منضدة في المدرسة كلها؟',
    correctAnswer: '216',
    unitId: 'unit2',
    lessonId: 'u2-l7',
    score: 5
  },
  {
    id: 'rw-u2-h2',
    type: 'fill',
    text: 'حمل قطار عطبرة للركاب 32 صندوقاً خشبياً من البضائع، إذا كان وزن الصندوق الواحد 14 كيلوجراماً، فما هو الوزن الإجمالي للصناديق؟',
    correctAnswer: '448',
    unitId: 'unit2',
    lessonId: 'u2-l7',
    score: 5
  },

  // Unit 3 Easy
  {
    id: 'rw-u3-e1',
    type: 'choice',
    text: 'يريد الأب توزيع 14 جنيهاً على ولديه بالتساوي. كم يأخذ كل ولد؟',
    options: ['7 جنيهات', '6 جنيهات', '8 جنيهات', '5 جنيهات'],
    correctAnswer: '7 جنيهات',
    unitId: 'unit3',
    lessonId: 'u3-l1',
    score: 5
  },
  {
    id: 'rw-u3-e2',
    type: 'fill',
    text: 'قطف محمود 21 حبة ليمون حامض من شجرة الحديقة ووزعها بالتساوي على 7 صحون. كم ليمونة في كل صحن؟',
    correctAnswer: '3',
    unitId: 'unit3',
    lessonId: 'u3-l1',
    score: 5
  },
  // Unit 3 Medium
  {
    id: 'rw-u3-m1',
    type: 'fill',
    text: 'وزعت أمي 56 قطعة من بسكويت ديم بالتساوي على 7 من أطفال العائلة. فكم نصيب كل طفل؟',
    correctAnswer: '8',
    unitId: 'unit3',
    lessonId: 'u3-l1',
    score: 5
  },
  {
    id: 'rw-u3-m2',
    type: 'choice',
    text: 'اشترت مريم 7 كراسات للرسم بمبلغ 42 جنيهاً. فما هو ثمن الكراسة الواحدة؟',
    options: ['6 جنيهات', '7 جنيهات', '5 جنيهات', '8 جنيهات'],
    correctAnswer: '6 جنيهات',
    unitId: 'unit3',
    lessonId: 'u3-l4',
    score: 5
  },
  // Unit 3 Hard
  {
    id: 'rw-u3-h1',
    type: 'fill',
    text: 'مزارع في ولاية كسلا جنى 952 ثمرة برتقال حلو، وقام بتعبئتها بالتساوي في 7 صناديق خشبية كبيرة لشحنها. كم برتقالة في كل صندوق؟',
    correctAnswer: '136',
    unitId: 'unit3',
    lessonId: 'u3-l2',
    score: 5
  },
  {
    id: 'rw-u3-h2',
    type: 'choice',
    text: 'إذا كان مع جمعية الحارة 815 جنيهاً ويريدون توزيعها بالتساوي كصدقات على 7 أسر محتاجة، فكم نصيب كل أسرة؟ وكم جنيهاً يتبقى فائضاً؟',
    options: ['116 والباقي 3', '115 والباقي 2', '110 والباقي 5', '116 والباقي 1'],
    correctAnswer: '116 والباقي 3',
    unitId: 'unit3',
    lessonId: 'u3-l1',
    score: 5
  },

  // Unit 4 Easy
  {
    id: 'rw-u4-e1',
    type: 'choice',
    text: 'قسمت أم أحمد رغيفاً بلدياً دافئاً إلى 3 أجزاء متطابقة بالتساوي لثلاثة إخوة. ما هو الكسر الذي يمثل نصيب الأخ الواحد؟',
    options: ['1/3 (ثلث)', '1/2 (نصف)', '1/4 (ربع)', '1/5 (خمس)'],
    correctAnswer: '1/3 (ثلث)',
    unitId: 'unit4',
    lessonId: 'u4-l1',
    score: 5
  },
  // Unit 4 Medium
  {
    id: 'rw-u4-m1',
    type: 'choice',
    text: 'في شجرة بستاننا 8 طيور مغردة (قمرية)، طارت منها 5 طيور في الصباح وبقيت 3 طيور على الغصن. ما هو الكسر الذي يمثل الطيور التي بقيت؟',
    options: ['3/8 (ثلاثة أثمان)', '5/8 (خمسة أثمان)', '1/2 (نصف)', '1/8 (ثمن)'],
    correctAnswer: '3/8 (ثلاثة أثمان)',
    unitId: 'unit4',
    lessonId: 'u4-l2',
    score: 5
  },
  {
    id: 'rw-u4-m2',
    type: 'fill',
    text: 'قسم مزارع قطعة أرضه إلى 6 أجزاء متساوية وزرع 3 منها بالبامية الخضراء. ما هو الكسر الذي يمثل الأرض المزروعة بامية في أبسط صورة؟',
    correctAnswer: '1/2',
    unitId: 'unit4',
    lessonId: 'u4-l2',
    score: 5
  },
  // Unit 4 Hard
  {
    id: 'rw-u4-h1',
    type: 'fill',
    text: 'في وجبة العشاء، أكل طارق 2/8 من فطيرة الدخن الساخنة، وأكل شقيقه عمر 3/8 من نفس الفطيرة. ما هو الكسر الإجمالي الذي أكله الشقيقان معاً؟',
    correctAnswer: '5/8',
    unitId: 'unit4',
    lessonId: 'u4-l3',
    score: 5
  },
  {
    id: 'rw-u4-h2',
    type: 'fill',
    text: 'كان في خزان بائعة اللبن 5/6 من السعة، باعت منه للزبائن ما يعادل 1/6 السعة. كم يتبقى في الخزان في أبسط صورة؟',
    correctAnswer: '2/3',
    unitId: 'unit4',
    lessonId: 'u4-l3',
    score: 5
  },

  // Unit 5 Easy
  {
    id: 'rw-u5-e1',
    type: 'fill',
    text: 'يقيس النجار عثمان طول طاولة صغيرة بالقدم، فإذا كان طولها يساوي 3 أقدام، فكم ياردة تساوي؟',
    correctAnswer: '1',
    unitId: 'unit5',
    lessonId: 'u5-l1',
    score: 5
  },
  // Unit 5 Medium
  {
    id: 'rw-u5-m1',
    type: 'fill',
    text: 'ممر مائي في حديقة المقرن بالخرطوم طوله يبلغ ياردتين اثنتين. فكم قدماً يساوي هذا الممر؟',
    correctAnswer: '6',
    unitId: 'unit5',
    lessonId: 'u5-l1',
    score: 5
  },
  // Unit 5 Hard
  {
    id: 'rw-u5-h1',
    type: 'fill',
    text: 'يمشي بطل السباق مسافة ميل واحد يومياً للحفاظ على صحته وقوته. كم ياردة يقطع البطل في هذا الميل؟',
    correctAnswer: '1760',
    unitId: 'unit5',
    lessonId: 'u5-l1',
    score: 5
  },

  // Unit 6 Easy
  {
    id: 'rw-u6-e1',
    type: 'choice',
    text: 'سياج حديدي يحيط بحديقة على شكل مثلث، فكم ضلعاً لهذا السياج الدائري؟',
    options: ['3 أضلاع', '4 أضلاع', '5 أضلاع', 'لا توجد أضلاع'],
    correctAnswer: '3 أضلاع',
    unitId: 'unit6',
    lessonId: 'u6-l2',
    score: 5
  },
  // Unit 6 Medium
  {
    id: 'rw-u6-m1',
    type: 'fill',
    text: 'طاولة دراسية مربعة الشكل طول أحد أضلاعها يساوي 50 سم. فكم يبلغ طول الأضلاع الثلاثة الأخرى مجتمعة بالسنتمتر؟',
    correctAnswer: '150',
    unitId: 'unit6',
    lessonId: 'u6-l2',
    score: 5
  },
  // Unit 6 Hard
  {
    id: 'rw-u6-h1',
    type: 'fill',
    text: 'اشترى عمنا النور سجادة مستطيلة الشكل لغرفة الصلاة طولها 4 أمتار وعرضها 2 متر. إذا أراد إحاطتها بشريط ذهبي، فما هو الطول الإجمالي للشريط المطلوب بالأمتار؟',
    correctAnswer: '12',
    unitId: 'unit6',
    lessonId: 'u6-l2',
    score: 5
  }
];

interface InteractiveQuizProps {
  user: UserProfile;
  scope: { type: 'lesson' | 'unit' | 'all'; id?: string; title: string };
  onClose: () => void;
  onSaveReport: (result: QuizResult) => void;
  onAwardPoints: (points: number) => void;
}

export default function InteractiveQuiz({
  user,
  scope,
  onClose,
  onSaveReport,
  onAwardPoints
}: InteractiveQuizProps) {
  // Quiz setup
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [isSubmitted, setIsCompleted] = useState<boolean>(false);
  const [secondsSpent, setSecondsSpent] = useState<number>(0);
  const [reportResult, setReportResult] = useState<QuizResult | null>(null);
  const [showShareTooltip, setShowShareTooltip] = useState<boolean>(false);

  // Difficulty & Custom Selection states
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionSource, setQuestionSource] = useState<'mixed' | 'real-world' | 'standard'>('mixed');

  // Timer effect
  useEffect(() => {
    if (!quizStarted || isSubmitted) return;
    const interval = setInterval(() => {
      setSecondsSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [quizStarted, isSubmitted]);

  // Handler to configure and start the customized quiz
  const handleStartQuiz = () => {
    let sourcePool: Question[] = [];

    if (questionSource === 'standard') {
      sourcePool = [...questionPool];
    } else if (questionSource === 'real-world') {
      sourcePool = [...realWorldQuestions];
    } else {
      sourcePool = [...questionPool, ...realWorldQuestions];
    }

    // Filter by scope
    let filtered = sourcePool;
    if (scope.type === 'lesson' && scope.id) {
      filtered = sourcePool.filter(q => q.lessonId === scope.id);
    } else if (scope.type === 'unit' && scope.id) {
      filtered = sourcePool.filter(q => q.unitId === scope.id);
    }

    // Primary Fallback if empty in specific subset (e.g. no custom real-world for specific rare lesson, fallback to standard lesson pool)
    if (filtered.length === 0) {
      filtered = [...questionPool, ...realWorldQuestions].filter(q => {
        if (scope.type === 'lesson' && scope.id) return q.lessonId === scope.id;
        if (scope.type === 'unit' && scope.id) return q.unitId === scope.id;
        return true;
      });
    }

    // Filter by difficulty or simulate difficulty by score limits
    let difficultyFiltered = filtered;
    if (difficulty === 'easy') {
      difficultyFiltered = filtered.filter(q => q.type !== 'fill' || q.score <= 5);
    } else if (difficulty === 'hard') {
      difficultyFiltered = filtered.filter(q => q.type === 'fill' || q.text.length > 40 || q.id.startsWith('rw'));
    }

    // Secondary fallback
    if (difficultyFiltered.length === 0) {
      difficultyFiltered = filtered;
    }

    // Shuffle and pick up to 10
    const shuffled = difficultyFiltered.sort(() => 0.5 - Math.random()).slice(0, 10);
    setQuestions(shuffled);
    setCurrentIdx(0);
    setAnswers({});
    setIsCompleted(false);
    setSecondsSpent(0);
    setReportResult(null);
    setQuizStarted(true);
  };

  if (!quizStarted) {
    return (
      <div className="flex-1 overflow-y-auto p-6 font-sans space-y-6 animate-fade-in" dir="rtl" id="quiz-setup-container">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 shadow-xl border-b-4 border-indigo-200">
          <div className="text-center space-y-3 mb-8">
            <span className="text-4xl inline-block animate-bounce">🎯</span>
            <h2 className="text-2xl font-black text-gray-800">مرحباً بك في تحدي الذكاء التفاعلي!</h2>
            <p className="text-sm text-gray-500 font-bold">
              اضبط معايير الاختبار المخصص لتبدأ مغامرة ممتعة في مادة الرياضيات
            </p>
          </div>

          <div className="space-y-6">
            {/* Difficulty Setting */}
            <div className="space-y-3">
              <label className="block text-sm font-black text-gray-700">1. اختر مستوى الصعوبة المناسب لك يا بطل:</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setDifficulty('easy')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 ${
                    difficulty === 'easy'
                      ? 'border-green-500 bg-green-50/70 text-green-900 shadow-md scale-102'
                      : 'border-gray-100 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <span className="text-2xl">🟢</span>
                  <span className="font-black text-sm">سهل جداً</span>
                  <span className="text-[10px] opacity-70">أرقام ومسائل بسيطة</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDifficulty('medium')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 ${
                    difficulty === 'medium'
                      ? 'border-amber-500 bg-amber-50/70 text-amber-900 shadow-md scale-102'
                      : 'border-gray-100 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <span className="text-2xl">🟡</span>
                  <span className="font-black text-sm">متوسط</span>
                  <span className="text-[10px] opacity-70">تحديات عادية للمنهج</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDifficulty('hard')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 ${
                    difficulty === 'hard'
                      ? 'border-red-500 bg-red-50/70 text-red-900 shadow-md scale-102'
                      : 'border-gray-100 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <span className="text-2xl">🔴</span>
                  <span className="font-black text-sm">صعب وأذكياء</span>
                  <span className="text-[10px] opacity-70">مسائل ذكاء متقدمة</span>
                </button>
              </div>
            </div>

            {/* Question Type Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-black text-gray-700">2. اختر نوعية أسئلة الاختبار:</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setQuestionSource('standard')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 ${
                    questionSource === 'standard'
                      ? 'border-blue-500 bg-blue-50/70 text-blue-900 shadow-md'
                      : 'border-gray-100 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <span className="text-xl">✏️</span>
                  <span className="font-black text-xs">مسائل تقليدية مباشرة</span>
                </button>

                <button
                  type="button"
                  onClick={() => setQuestionSource('real-world')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 ${
                    questionSource === 'real-world'
                      ? 'border-indigo-500 bg-indigo-50/70 text-indigo-900 shadow-md'
                      : 'border-gray-100 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <span className="text-xl">🌴</span>
                  <span className="font-black text-xs">مسائل من واقع الحياة اليومية</span>
                </button>

                <button
                  type="button"
                  onClick={() => setQuestionSource('mixed')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 ${
                    questionSource === 'mixed'
                      ? 'border-purple-500 bg-purple-50/70 text-purple-900 shadow-md'
                      : 'border-gray-100 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <span className="text-xl">✨</span>
                  <span className="font-black text-xs">مزيج من النوعين</span>
                </button>
              </div>
            </div>

            {/* Info Badge */}
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 text-xs text-amber-900 font-bold leading-relaxed flex items-center gap-3">
              <span className="text-xl shrink-0">💡</span>
              <p>
                عزيزي الطالب، هذا الاختبار مصمم خصيصاً لمساعدتك على تقييم مستواك في موضوع: <strong className="text-indigo-600">({scope.title})</strong>. ستحصل على 10 نقاط كاملة مقابل كل إجابة صحيحة لتنافس أصدقائك في لوحة المتصدرين!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all cursor-pointer text-sm shrink-0"
              >
                رجوع للخلف
              </button>

              <button
                type="button"
                onClick={handleStartQuiz}
                className="flex-1 py-3.5 bg-gradient-to-l from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-black rounded-2xl shadow-md hover:shadow-lg active:scale-95 transition-all text-base flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>ابدأ الاختبار الممتع الآن ⚡</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (quizStarted && questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-gray-100 text-center" dir="rtl">
        <AlertCircle className="w-12 h-12 text-yellow-500 mb-2" />
        <h3 className="text-lg font-black text-gray-700">لم نجد أسئلة كافية تتطابق مع الاختيارات الحالية!</h3>
        <p className="text-gray-400 text-xs mt-1">يرجى تغيير الإعدادات واختيار نطاق أوسع أو خلط المسائل.</p>
        <button onClick={() => setQuizStarted(false)} className="mt-4 px-5 py-2.5 bg-amber-400 text-amber-950 font-black rounded-xl cursor-pointer">
          تعديل الإعدادات
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];

  // Answer handler
  const handleSelectAnswer = (ans: string | boolean) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: ans
    }));
  };

  // Submit quiz handler & generate detailed performance report
  const handleSubmitQuiz = () => {
    setIsCompleted(true);

    // Calculate score
    let correctCount = 0;
    questions.forEach(q => {
      const uAns = answers[q.id];
      if (uAns !== undefined) {
        if (typeof q.correctAnswer === 'boolean') {
          if (uAns === q.correctAnswer) correctCount++;
        } else {
          if (uAns.toString().trim() === q.correctAnswer.toString().trim()) correctCount++;
        }
      }
    });

    const percentage = Math.round((correctCount / questions.length) * 100);
    const earnedPoints = correctCount * 10; // 10 points per correct answer

    // Generate analytical performance recommendations
    let strength = "ممتاز في قراءة المعطيات الأساسية للأرقام والمسائل.";
    let improvement = "يحتاج إلى مزيد من التركيز في العمليات الحسابية الطويلة.";
    let recommendation = "ننصحك بمراجعة جدول السبعة والثمانية مع تكرار تمرين المعداد السحري لترسيخ المفاهيم.";

    if (percentage >= 90) {
      strength = "عبقري وبطل متمكن للغاية من كامل المهارات الهندسية والحسابية المستهدفة!";
      improvement = "مستوى ممتاز جداً ولا توجد نقاط ضعف واضحة.";
      recommendation = "استمر في هذا الأداء الرائع وحل أوراق العمل المتقدمة لتحدي نفسك أكثر! 🚀";
    } else if (percentage >= 70) {
      strength = "قوي جداً في حل المسائل المباشرة والسريعة والكسور.";
      improvement = "تحتاج لتطوير مهارات ضرب الأعداد المكونة من رقمين وتوزيع الضرب.";
      recommendation = "ننصحك بمراجعة الدرس السادس من وحدة الضرب والتدرب عليها بالأرقام البسيطة.";
    } else if (percentage < 50) {
      strength = "لديك رغبة جيدة في التعلم وتحاول بجد.";
      improvement = "تحتاج إلى مراجعة الأساسيات وعمليات الجمع والطرح بالاستلاف بدقة.";
      recommendation = "ننصحك بإعادة قراءة الدرس الأول والثاني من الوحدة الأولى واستخدام المعداد التفاعلي يومياً لمدة 10 دقائق.";
    }

    const result: QuizResult = {
      quizId: `quiz-${Date.now()}`,
      title: scope.title,
      date: new Date().toLocaleDateString('ar-SA'),
      score: earnedPoints,
      totalQuestions: questions.length,
      percentage,
      correctAnswers: correctCount,
      wrongAnswers: questions.length - correctCount,
      timeSpentSeconds: secondsSpent,
      unitIds: Array.from(new Set(questions.map(q => q.unitId))),
      lessonIds: Array.from(new Set(questions.map(q => q.lessonId))),
      performanceAnalysis: {
        strength,
        improvement,
        recommendation
      }
    };

    setReportResult(result);
    onSaveReport(result);
    onAwardPoints(earnedPoints);
  };

  // Copy report for sharing
  const handleCopyReport = () => {
    if (!reportResult) return;
    const reportText = `🏆 تقرير الأداء التعليمي للبطل ${user.name} في مادة الرياضيات (الصف الثالث):
- المنهج: ${reportResult.title}
- النتيجة النهائية: ${reportResult.correctAnswers} من أصل ${reportResult.totalQuestions} (${reportResult.percentage}%)
- نقاط القوة: ${reportResult.performanceAnalysis.strength}
- التوصية التعليمية: ${reportResult.performanceAnalysis.recommendation}
منصة نقلة للمناهج الإلكترونية 🎒`;

    navigator.clipboard.writeText(reportText);
    setShowShareTooltip(true);
    setTimeout(() => setShowShareTooltip(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 font-sans space-y-6" dir="rtl" id="quiz-screen-container">
      {/* Quiz Active Interface */}
      {!isSubmitted ? (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 shadow-xl border-b-4 border-indigo-200">
          {/* Header Progress */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
            <div>
              <span className="text-xs font-black text-indigo-500 uppercase">اختبار تفاعلي مستمر</span>
              <h3 className="text-lg font-black text-gray-800">{scope.title}</h3>
            </div>
            <div className="text-left font-mono font-bold text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl">
              ⏱️ {Math.floor(secondsSpent / 60)}:{(secondsSpent % 60).toString().padStart(2, '0')}
            </div>
          </div>

          {/* Question Navigator Dots */}
          <div className="flex gap-1.5 justify-center mb-6 flex-wrap">
            {questions.map((_, idx) => (
              <span
                key={idx}
                className={`h-2.5 rounded-full transition-all ${
                  idx === currentIdx
                    ? 'w-8 bg-indigo-500'
                    : answers[questions[idx].id] !== undefined
                    ? 'w-2.5 bg-green-400'
                    : 'w-2.5 bg-gray-200'
                }`}
              ></span>
            ))}
          </div>

          {/* Question Text */}
          <div className="bg-indigo-50/50 border-2 border-indigo-100 p-5 rounded-2xl mb-6 relative overflow-hidden">
            <span className="absolute -bottom-6 -left-6 text-7xl opacity-5">📝</span>
            <p className="text-xs text-indigo-600 font-black mb-1">السؤال {currentIdx + 1} من {questions.length}</p>
            <h4 className="text-lg font-black text-gray-800 leading-relaxed">
              {currentQuestion.text}
            </h4>
          </div>

          {/* Options / Answer Input Fields */}
          <div className="space-y-3 mb-8">
            {/* Multiple Choice Options */}
            {currentQuestion.type === 'choice' && currentQuestion.options && (
              <div className="grid grid-cols-1 gap-2.5">
                {currentQuestion.options.map((opt) => {
                  const isSelected = answers[currentQuestion.id] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelectAnswer(opt)}
                      className={`w-full p-4 rounded-xl font-bold text-base text-right transition-all cursor-pointer border-2 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900 shadow-md'
                          : 'border-gray-100 hover:border-indigo-200 bg-gray-50/50 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {/* True or False options */}
            {currentQuestion.type === 'boolean' && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: true, label: 'صحيحة ✅' },
                  { value: false, label: 'خاطئة ❌' }
                ].map((item) => {
                  const isSelected = answers[currentQuestion.id] === item.value;
                  return (
                    <button
                      key={item.label}
                      onClick={() => handleSelectAnswer(item.value)}
                      className={`p-5 rounded-2xl font-black text-base transition-all cursor-pointer border-2 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900 shadow-md'
                          : 'border-gray-100 hover:border-indigo-200 bg-gray-50/50 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Fill-in blankets input */}
            {currentQuestion.type === 'fill' && (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="اكتب إجابتك هنا يا بطل بوضوح"
                  value={(answers[currentQuestion.id] as string) || ''}
                  onChange={(e) => handleSelectAnswer(e.target.value)}
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl text-center font-bold text-base outline-none focus:border-indigo-400"
                />
                <p className="text-[10px] text-gray-400 font-bold text-center">تأكد من كتابة الأرقام أو الكلمات بدقة فائقة.</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIdx() === 0}
              className="px-5 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-600 font-bold py-2.5 rounded-xl transition-all cursor-pointer"
            >
              السابق
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx(prev => prev + 1)}
                className="px-6 bg-indigo-500 hover:bg-indigo-600 text-white font-black py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
              >
                التالي
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(answers).length === 0}
                className="px-8 bg-green-500 hover:bg-green-600 text-white font-black py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                تسليم وتصحيح الاختبار 🎓
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Detailed Analytical Educational Performance Report */
        reportResult && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Header Result Card */}
            <div className="bg-gradient-to-l from-[#FFFBEB] to-yellow-50 rounded-3xl p-6 border-4 border-yellow-300 shadow-xl text-center relative overflow-hidden">
              <div className="absolute top-2 left-2 text-6xl opacity-10">🏆</div>
              <h2 className="text-2xl font-black text-yellow-900 mb-1">تهانينا يا بطل المناهج! 🎉</h2>
              <p className="text-gray-500 text-xs font-bold">لقد أكملت اختبار الرياضيات وبنيت مهاراتك بنجاح!</p>

              <div className="flex justify-center items-center gap-6 my-6">
                {/* Visual Circle Score */}
                <div className="relative w-28 h-28 flex items-center justify-center bg-white rounded-full border-4 border-yellow-200 shadow-md">
                  <div className="text-center">
                    <span className="text-3xl font-black text-yellow-600 font-mono">{reportResult.percentage}%</span>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">درجة الإتقان</p>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <p className="text-sm font-black text-gray-700">
                    الدرجة المستحقة: <span className="text-yellow-600 font-mono font-black">{reportResult.correctAnswers} / {reportResult.totalQuestions}</span> صحيحة
                  </p>
                  <p className="text-sm font-bold text-gray-500">
                    النقاط المكتسبة: <span className="text-green-600 font-mono font-black">+{reportResult.score} 🌟</span>
                  </p>
                  <p className="text-sm font-bold text-gray-500">
                    الزمن المستغرق: <span className="text-indigo-600 font-mono font-black">{Math.floor(reportResult.timeSpentSeconds / 60)} دقيقة و {reportResult.timeSpentSeconds % 60} ثانية</span>
                  </p>
                </div>
              </div>

              {/* Action Report buttons */}
              <div className="flex justify-center gap-3 pt-4 border-t border-yellow-200 flex-wrap">
                <button
                  onClick={handleCopyReport}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all relative cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>مشاركة التقرير مع المعلم أو الزملاء 🔗</span>
                  {showShareTooltip && (
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md whitespace-nowrap">
                      تم نسخ تقرير الأداء بنجاح! ✅
                    </span>
                  )}
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black rounded-xl text-xs flex items-center gap-1.5 border border-gray-200 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة وحفظ التقرير 🖨️</span>
                </button>
              </div>
            </div>

            {/* Performance Analysis Box */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md space-y-4">
              <h3 className="font-black text-gray-800 text-lg flex items-center gap-1.5 pb-2 border-b border-gray-100">
                <span className="w-2.5 h-6 bg-indigo-500 rounded-full inline-block"></span>
                تقرير الأداء التعليمي المفصل:
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 border border-green-100 rounded-2xl">
                  <h4 className="font-black text-green-800 text-sm mb-1">💪 نقاط القوة المكتشفة:</h4>
                  <p className="text-xs text-green-700 leading-relaxed font-sans">{reportResult.performanceAnalysis.strength}</p>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                  <h4 className="font-black text-orange-800 text-sm mb-1">🎯 مهارات تحتاج لتدريب:</h4>
                  <p className="text-xs text-orange-700 leading-relaxed font-sans">{reportResult.performanceAnalysis.improvement}</p>
                </div>
              </div>

              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                <h4 className="font-black text-indigo-800 text-sm mb-1">📚 التوصية التعليمية الذكية للتحسن:</h4>
                <p className="text-xs text-indigo-700 leading-relaxed font-sans">{reportResult.performanceAnalysis.recommendation}</p>
              </div>
            </div>

            {/* Question by Question Review */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md space-y-4">
              <h3 className="font-black text-gray-800 text-base">مراجعة الأسئلة وحلولها النموذجية:</h3>

              <div className="space-y-4">
                {questions.map((q, idx) => {
                  const uAns = answers[q.id];
                  let isCorrect = false;
                  if (uAns !== undefined) {
                    if (typeof q.correctAnswer === 'boolean') {
                      isCorrect = uAns === q.correctAnswer;
                    } else {
                      isCorrect = uAns.toString().trim() === q.correctAnswer.toString().trim();
                    }
                  }

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-2xl border-2 flex justify-between gap-4 items-start ${
                        isCorrect ? 'border-green-100 bg-green-50/10' : 'border-red-100 bg-red-50/10'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <p className="text-xs text-gray-400 font-bold">السؤال ({idx + 1})</p>
                        <h4 className="font-bold text-sm text-gray-800 leading-relaxed">{q.text}</h4>
                        <div className="text-xs space-y-1 pt-1 font-sans">
                          <p className="text-gray-500 font-medium">
                            إجابتك: <span className={isCorrect ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>
                              {uAns === undefined ? 'لم يتم حل السؤال' : typeof uAns === 'boolean' ? (uAns ? 'صحيحة ✅' : 'خاطئة ❌') : uAns.toString()}
                            </span>
                          </p>
                          <p className="text-slate-600 font-bold">
                            الإجابة النموذجية: <span className="text-green-600">
                              {typeof q.correctAnswer === 'boolean' ? (q.correctAnswer ? 'صحيحة ✅' : 'خاطئة ❌') : q.correctAnswer.toString()}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 pt-1">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Back Button */}
            <div className="text-center pt-2">
              <button
                onClick={onClose}
                className="px-8 py-3 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black rounded-2xl shadow-md transition-colors cursor-pointer text-base"
              >
                العودة للصفحة الرئيسية
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );

  function currentQuestionIndex() {
    return currentIdx;
  }

  function setCurrentQuestionIndex(val: number | ((prev: number) => number)) {
    if (typeof val === 'function') {
      setCurrentIdx(val(currentIdx));
    } else {
      setCurrentIdx(val);
    }
  }
}
