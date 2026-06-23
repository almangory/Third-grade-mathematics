import { Lesson, Unit, UserProfile } from '../types';
import { curriculumUnits, diagramConfigs, mockMatchingData, diagramConfigs as allDiagrams, mockMatchingData as allMatches } from '../data/curriculumData';
import { Sparkles, Printer, FileText, Download, CheckSquare, Settings, Lock, Unlock, Eye, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useRef, FormEvent } from 'react';

interface WorksheetGeneratorProps {
  user: UserProfile;
  favorites: string[];
  isWatermarkRemoved: boolean;
  onUnlockWatermark: (password: string) => boolean;
}

interface GeneratedQuestion {
  id: string;
  type: 'true_false' | 'fill_blank' | 'matching' | 'label_diagram';
  text: string;
  correctAnswer?: string;
  options?: string[];
  leftItems?: string[];
  rightItems?: string[];
  diagramImg?: string;
  labels?: { id: string; name: string; x: number; y: number }[];
}

export default function WorksheetGenerator({
  user,
  favorites,
  isWatermarkRemoved,
  onUnlockWatermark
}: WorksheetGeneratorProps) {
  // Config states
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['true_false', 'fill_blank', 'matching', 'label_diagram']);
  const [scopeType, setScopeType] = useState<'all' | 'favorites' | 'unit' | 'lesson'>('all');
  const [selectedUnitId, setSelectedUnitId] = useState<string>(curriculumUnits[0].id);
  const [selectedLessonId, setSelectedLessonId] = useState<string>(curriculumUnits[0].lessons[0].id);
  const [pagesCount, setPagesCount] = useState<number>(1);
  const [showAnswers, setShowAnswers] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedPages, setGeneratedPages] = useState<GeneratedQuestion[][]>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [realWorldOnly, setRealWorldOnly] = useState<boolean>(false);

  // Password unlock state
  const [password, setPassword] = useState('');
  const [pwdError, setPasswordError] = useState(false);
  const [showPwdForm, setShowPwdForm] = useState(false);

  // References
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Types definitions
  const questionTypes = [
    { id: 'true_false', label: 'صح أم خطأ ❌ / ✅' },
    { id: 'fill_blank', label: 'أكمل الفراغ ✏️' },
    { id: 'matching', label: 'توصيل الكلمات 🔗' },
    { id: 'label_diagram', label: 'إيضاح مكونات الرسمة 🎨' }
  ];

  // Helper to get active units / lessons list
  const activeLessons = curriculumUnits.find(u => u.id === selectedUnitId)?.lessons || [];

  // Handle password check
  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    const success = onUnlockWatermark(password);
    if (success) {
      setPassword('');
      setPasswordError(false);
      setShowPwdForm(false);
    } else {
      setPasswordError(true);
    }
  };

  // Worksheet Question Generator Core Engine
  const handleGenerate = () => {
    setIsGenerating(true);

    setTimeout(() => {
      // Gather pool of applicable lessons based on scope
      let targetLessonIds: string[] = [];
      if (scopeType === 'all') {
        targetLessonIds = curriculumUnits.flatMap(u => u.lessons.map(l => l.id));
      } else if (scopeType === 'favorites') {
        targetLessonIds = favorites;
      } else if (scopeType === 'unit') {
        const u = curriculumUnits.find(unit => unit.id === selectedUnitId);
        targetLessonIds = u ? u.lessons.map(l => l.id) : [];
      } else if (scopeType === 'lesson') {
        targetLessonIds = [selectedLessonId];
      }

      if (targetLessonIds.length === 0) {
        // Fallback to all if favorites is empty
        targetLessonIds = curriculumUnits.flatMap(u => u.lessons.map(l => l.id));
      }

      const newPages: GeneratedQuestion[][] = [];

      // Generate content for each requested A4 page
      for (let p = 0; p < pagesCount; p++) {
        const pageQuestions: GeneratedQuestion[] = [];

        // 1. Add True/False if selected
        if (selectedTypes.includes('true_false')) {
          let tfPool = [
            // Standard + Easy
            { text: 'أي عدد نضربه في صفر، يكون الناتج دائماً صفراً.', correct: 'صح', isReal: false, diff: 'easy' },
            { text: 'يكتب العدد (سبعة عشر) بالأرقام هكذا: 17', correct: 'صح', isReal: false, diff: 'easy' },
            { text: 'اليوم الكامل يحتوي على 24 ساعة.', correct: 'صح', isReal: false, diff: 'easy' },

            // Real-World + Easy
            { text: 'إذا كان مع أحمد 5 تفاحات وأعطى أخته 3 تفاحات، يتبقى معه تفاحتان اثنتان.', correct: 'صح', isReal: true, diff: 'easy' },
            { text: 'ثمن قطعة الحلوى 5 جنيهات، إذا اشتريت قطعتين تدفع 15 جنيهاً.', correct: 'خطأ', isReal: true, diff: 'easy' },

            // Standard + Medium
            { text: 'يكتب العدد (ألفان وثلاثة وسبعون) بالأرقام هكذا: 2073', correct: 'صح', isReal: false, diff: 'medium' },
            { text: 'المستطيل هو شكل رباعي فيه كل أضلاعه الأربعة متساوية تماماً في الطول.', correct: 'خطأ', isReal: false, diff: 'medium' },
            { text: 'عند ضرب أي عدد في 100، نكتب نفس العدد ونضع صفرين على يمينه.', correct: 'صح', isReal: false, diff: 'medium' },

            // Real-World + Medium
            { text: 'اشترى علي 3 كراسات رسم، إذا كان ثمن الكراسة 6 جنيهات، يدفع للبائع 18 جنيهاً.', correct: 'صح', isReal: true, diff: 'medium' },
            { text: 'وزعت فاطمة 20 حبة تمر على 4 من صديقاتها بالتساوي، نصيب كل واحدة هو 5 تمرات.', correct: 'صح', isReal: true, diff: 'medium' },

            // Standard + Hard
            { text: 'الكسر 1/2 (النصف) أصغر من الكسر 1/4 (الربع) لأن الرقم 4 أكبر من 2.', correct: 'خطأ', isReal: false, diff: 'hard' },
            { text: 'الخط المستقيم له نقطة بداية ونقطة نهاية محددة.', correct: 'خطأ', isReal: false, diff: 'hard' },

            // Real-World + Hard
            { text: 'يمشي عداء مسافة ميل واحد يومياً، وهو ما يعادل 1760 ياردة تماماً.', correct: 'صح', isReal: true, diff: 'hard' },
            { text: 'إذا كان في خزان اللبن 5/6 السعة وتم بيع 1/6 السعة، يتبقى في الخزان ثلث السعة.', correct: 'خطأ', isReal: true, diff: 'hard' }
          ];

          // Filter by realWorldOnly and difficulty
          let filtered = tfPool;
          if (realWorldOnly) {
            filtered = filtered.filter(q => q.isReal);
          }
          filtered = filtered.filter(q => q.diff === difficulty);

          // Fallback if empty
          if (filtered.length < 2) {
            filtered = tfPool.filter(q => q.diff === difficulty);
          }
          if (filtered.length < 2) {
            filtered = tfPool;
          }

          // Pick 2 random
          const shuffled = [...filtered].sort(() => 0.5 - Math.random());
          pageQuestions.push({
            id: `q-tf-1-${p}`,
            type: 'true_false',
            text: `ضع علامة (صح) أو (خطأ) أمام العبارات التالية:\n1. ${shuffled[0].text}\n2. ${shuffled[1].text}`,
            correctAnswer: `1. [ ${shuffled[0].correct} ] ، 2. [ ${shuffled[1].correct} ]`
          });
        }

        // 2. Add Fill Blanket if selected
        if (selectedTypes.includes('fill_blank')) {
          let fillPool = [
            // Standard + Easy
            { text: 'احسب ناتج الجمع البسيط: 5 + 4 = ........', correct: '9', isReal: false, diff: 'easy' },
            { text: 'العدد الفردي الذي يلي العدد 7 مباشرة هو ........', correct: '9', isReal: false, diff: 'easy' },

            // Real-World + Easy
            { text: 'مع أحمد 10 جنيهات، اشترى عصير بـ 6 جنيهات، بقي معه ........ جنيهات.', correct: '4', isReal: true, diff: 'easy' },
            { text: 'في علبة التلوين 6 أقلام، في علبتين متطابقتين يوجد ........ قلماً.', correct: '12', isReal: true, diff: 'easy' },

            // Standard + Medium
            { text: 'احسب ناتج الجمع التالي: 4126 + 1872 = ........', correct: '5998', isReal: false, diff: 'medium' },
            { text: 'احسب ناتج الطرح التالي: 5628 - 1313 = ........', correct: '4315', isReal: false, diff: 'medium' },
            { text: '9 × 9 = ........', correct: '81', isReal: false, diff: 'medium' },

            // Real-World + Medium
            { text: 'وزع أب 35 جنيها بالتساوي على 5 من أبنائه، نصيب كل ابن هو ........ جنيهات.', correct: '7', isReal: true, diff: 'medium' },
            { text: 'تضع أمي 7 قطع بسكويت في كل طبق، في 6 أطباق تضع ........ قطعة بسكويت.', correct: '42', isReal: true, diff: 'medium' },

            // Standard + Hard
            { text: 'القدم الواحد يحتوي على ........ بوصة.', correct: '12', isReal: false, diff: 'hard' },
            { text: 'ربع الساعة يحتوي على ........ دقيقة.', correct: '15', isReal: false, diff: 'hard' },
            { text: 'المثلث له ........ أضلاع و ........ رؤوس.', correct: '3 أضلاع و 3 رؤوس', isReal: false, diff: 'hard' },
            { text: 'في الكسر 3/4 ، يسمى الرقم 3 بالـ ........ والرقم 4 بالـ ........', correct: 'البسط ، المقام', isReal: false, diff: 'hard' },

            // Real-World + Hard
            { text: 'اشترى النور سجادة مستطيلة طولها 4 أمتار وعرضها 2 متر، محيط هذه السجادة يساوي ........ أمتار.', correct: '12', isReal: true, diff: 'hard' },
            { text: 'إذا قطف مزارع 952 برتقالة ووزعها بالتساوي على 7 صناديق، تحتوي كل منها على ........ برتقالة.', correct: '136', isReal: true, diff: 'hard' }
          ];

          let filtered = fillPool;
          if (realWorldOnly) {
            filtered = filtered.filter(q => q.isReal);
          }
          filtered = filtered.filter(q => q.diff === difficulty);

          if (filtered.length < 2) {
            filtered = fillPool.filter(q => q.diff === difficulty);
          }
          if (filtered.length < 2) {
            filtered = fillPool;
          }

          const shuffled = [...filtered].sort(() => 0.5 - Math.random());
          pageQuestions.push({
            id: `q-fb-1-${p}`,
            type: 'fill_blank',
            text: `أكمل الفراغات التالية بالإجابة الصحيحة:\n1. ${shuffled[0].text}\n2. ${shuffled[1].text}`,
            correctAnswer: `1. [ ${shuffled[0].correct} ] ، 2. [ ${shuffled[1].correct} ]`
          });
        }

        // 3. Add Matching if selected
        if (selectedTypes.includes('matching')) {
          const matchItem = allMatches[0];
          pageQuestions.push({
            id: `q-match-1-${p}`,
            type: 'matching',
            text: 'صل من العمود (أ) ما يناسبه من العمود (ب):',
            leftItems: matchItem.left,
            rightItems: [...matchItem.right].sort(() => 0.5 - Math.random()), // Shuffled right
            correctAnswer: matchItem.left.map((item, idx) => `${item} ➔ ${matchItem.right[matchItem.correct[idx]]}`).join(' | ')
          });
        }

        // 4. Add Diagram Labeling if selected
        if (selectedTypes.includes('label_diagram')) {
          const randomDiagram = allDiagrams[p % allDiagrams.length];
          pageQuestions.push({
            id: `q-diag-1-${p}`,
            type: 'label_diagram',
            text: `انظر إلى الرسمة أدناه واكتب أسماء المكونات المشار إليها بالأرقام: (${randomDiagram.title})`,
            diagramImg: randomDiagram.image,
            labels: randomDiagram.labels,
            correctAnswer: randomDiagram.labels.map(l => `${l.id}: ${l.name}`).join(' ، ')
          });
        }

        newPages.push(pageQuestions);
      }

      setGeneratedPages(newPages);
      setIsGenerating(false);
    }, 1000);
  };

  // Run initial generation on component mount
  useState(() => {
    handleGenerate();
  });

  // Printer handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 font-sans select-none" dir="rtl" id="worksheets-generator-tab">
      {/* Control Panel: Left (or Right depending on RTL) side */}
      <div className="w-full lg:w-80 bg-white rounded-3xl p-5 shadow-md border-b-4 border-gray-100 space-y-5 h-fit">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
          <div className="p-2 bg-green-100 text-green-600 rounded-xl">
            <Settings className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black text-gray-800">إعدادات توليد أوراق العمل</h3>
        </div>

        {/* 1. Select Question Types */}
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-wider block">أنواع الأسئلة المطلوبة:</label>
          <div className="space-y-2">
            {questionTypes.map((type) => {
              const checked = selectedTypes.includes(type.id);
              return (
                <label
                  key={type.id}
                  className={`flex items-center gap-2.5 p-3 bg-gray-50 border-2 rounded-xl text-xs font-black cursor-pointer transition-all ${
                    checked ? 'border-green-400 bg-green-50/20 text-green-800' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      if (checked) {
                        setSelectedTypes(selectedTypes.filter(id => id !== type.id));
                      } else {
                        setSelectedTypes([...selectedTypes, type.id]);
                      }
                    }}
                    className="accent-green-500 w-4 h-4 rounded"
                  />
                  <span>{type.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 2. Select Scope */}
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 block">نطاق المنهج الدراسي للاختبار:</label>
          <select
            value={scopeType}
            onChange={(e: any) => setScopeType(e.target.value)}
            className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-xs font-bold outline-none focus:border-green-400"
          >
            <option value="all">كامل المنهج الدراسي السوداني</option>
            <option value="favorites">من دروسي المفضلة فقط ({favorites.length})</option>
            <option value="unit">من وحدة دراسية كاملة</option>
            <option value="lesson">من درس واحد محدد</option>
          </select>
        </div>

        {/* Conditional scope selects */}
        {scopeType === 'unit' && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 block">اختر الوحدة الدراسية:</label>
            <select
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-xs font-bold outline-none"
            >
              {curriculumUnits.map(u => (
                <option key={u.id} value={u.id}>{u.title}</option>
              ))}
            </select>
          </div>
        )}

        {scopeType === 'lesson' && (
          <div className="space-y-2.5">
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">اختر الوحدة أولاً:</label>
              <select
                value={selectedUnitId}
                onChange={(e) => {
                  setSelectedUnitId(e.target.value);
                  const firstLesson = curriculumUnits.find(u => u.id === e.target.value)?.lessons[0].id;
                  if (firstLesson) setSelectedLessonId(firstLesson);
                }}
                className="w-full p-2 bg-gray-50 border-2 border-gray-100 rounded-xl text-xs font-bold outline-none"
              >
                {curriculumUnits.map(u => (
                  <option key={u.id} value={u.id}>{u.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">اختر الدرس الحقيقي:</label>
              <select
                value={selectedLessonId}
                onChange={(e) => setSelectedLessonId(e.target.value)}
                className="w-full p-2 bg-gray-50 border-2 border-gray-100 rounded-xl text-xs font-bold outline-none"
              >
                {activeLessons.map(l => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* New controls: Difficulty & Real World Toggle */}
        <div className="space-y-3 p-3 bg-amber-50/50 border border-amber-200/50 rounded-2xl">
          <div className="space-y-1">
            <label className="text-[11px] font-black text-amber-900 block">درجة صعوبة المسائل في الأوراق:</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <button
                  type="button"
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`py-1.5 px-1 rounded-xl text-[10px] font-black transition-all cursor-pointer border ${
                    difficulty === level
                      ? level === 'easy'
                        ? 'border-green-500 bg-green-500 text-white shadow-sm'
                        : level === 'medium'
                        ? 'border-amber-500 bg-amber-500 text-white shadow-sm'
                        : 'border-red-500 bg-red-500 text-white shadow-sm'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {level === 'easy' ? '🟢 سهل' : level === 'medium' ? '🟡 متوسط' : '🔴 صعب'}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-[10px] font-black text-amber-950 cursor-pointer">
            <input
              type="checkbox"
              checked={realWorldOnly}
              onChange={() => setRealWorldOnly(!realWorldOnly)}
              className="accent-amber-600 w-3.5 h-3.5 rounded"
            />
            <span>توليد مسائل من واقع الحياة اليومية فقط 🌴</span>
          </label>
        </div>

        {/* 3. Pages Count Selector */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-black text-gray-400 block">
            <span>عدد الصفحات المطلوبة (A4):</span>
            <span className="font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md font-bold">{pagesCount} / 20</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPagesCount(prev => Math.max(1, prev - 1))}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 active:scale-95 rounded-xl font-black text-lg transition-all cursor-pointer"
            >
              -
            </button>
            <input
              type="range"
              min="1"
              max="20"
              value={pagesCount}
              onChange={(e) => setPagesCount(parseInt(e.target.value))}
              className="flex-1 accent-green-500 cursor-pointer h-2 bg-gray-200 rounded-lg"
            />
            <button
              onClick={() => setPagesCount(prev => Math.min(20, prev + 1))}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 active:scale-95 rounded-xl font-black text-lg transition-all cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* 4. Options */}
        <div className="pt-2">
          <label className="flex items-center gap-2 p-2 text-xs font-bold text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showAnswers}
              onChange={() => setShowAnswers(!showAnswers)}
              className="accent-green-500 w-4 h-4 rounded"
            />
            <span>تضمين ورقة إجابات نموذجية للمعلمين</span>
          </label>
        </div>

        {/* Action Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || selectedTypes.length === 0}
          className="w-full py-3.5 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl shadow-md disabled:opacity-50 cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          <span>{isGenerating ? 'جاري التوليد والتحضير...' : 'تحديث وتوليد الأوراق 🔄'}</span>
        </button>

        {/* 5. Watermark Unlock Shortcut */}
        <div className="border-t border-gray-100 pt-4 text-center">
          {isWatermarkRemoved ? (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-2xl text-xs font-bold flex items-center gap-1.5 justify-center">
              <Unlock className="w-4 h-4" />
              <span>تمت إزالة العلامة المائية بنجاح! ✅</span>
            </div>
          ) : (
            <button
              onClick={() => setShowPwdForm(!showPwdForm)}
              className="text-xs text-gray-400 hover:text-amber-500 font-bold underline transition-colors cursor-pointer"
            >
              هل تريد إزالة العلامة المائية؟ (للمعلمين فقط)
            </button>
          )}

          {showPwdForm && !isWatermarkRemoved && (
            <form onSubmit={handlePasswordSubmit} className="mt-3 space-y-2 bg-gray-50 border border-gray-100 p-3 rounded-2xl">
              <input
                type="password"
                placeholder="أدخل الرمز السري لإزالة المائية"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(false);
                }}
                className={`w-full p-2 bg-white border-2 rounded-lg text-xs text-center font-mono outline-none ${
                  pwdError ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-amber-400'
                }`}
              />
              {pwdError && (
                <p className="text-[10px] text-red-500 font-bold">الرمز السري غير صحيح!</p>
              )}
              <button
                type="submit"
                className="w-full bg-amber-400 hover:bg-amber-500 text-amber-950 font-black py-1.5 rounded-lg text-xs cursor-pointer transition-colors"
              >
                تأكيد الرمز
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Preview Area: Right (or Left) side showing A4 sheets */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Actions above the A4 pages */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-right">
            <h4 className="text-sm font-black text-gray-800">معاينة المستند المولد (A4)</h4>
            <p className="text-[11px] text-gray-400 font-bold mt-0.5">راجع أوراق العمل قبل طباعتها للطلاب</p>
          </div>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer text-sm"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة أو حفظ كـ PDF 🖨️</span>
          </button>
        </div>

        {/* Simulated A4 pages container */}
        <div
          ref={printAreaRef}
          className="flex-1 space-y-8 overflow-y-auto max-h-[600px] p-4 bg-gray-100 rounded-3xl border border-gray-200/50 shadow-inner print:p-0 print:m-0 print:overflow-visible print:bg-white print:max-h-none"
        >
          {generatedPages.map((page, pIdx) => (
            <div
              key={pIdx}
              className="relative w-full max-w-[800px] min-h-[1130px] mx-auto bg-white p-12 shadow-xl border-t-[8px] border-green-500 font-sans text-right relative flex flex-col justify-between print:shadow-none print:border-t-0 print:p-8 print:w-full print:min-h-0 page-break-after"
              dir="rtl"
              style={{ aspectRatio: '1/1.4142' }} // exact A4 aspect ratio
            >
              {/* WATERMARK ELEMENT */}
              {!isWatermarkRemoved && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0 opacity-[0.04]">
                  <div className="text-center transform -rotate-45 font-sans font-black text-4xl whitespace-nowrap space-y-4">
                    <p>نقلة للمناهج الإلكترونية</p>
                    <p>نقلة للمناهج الإلكترونية</p>
                    <p>نقلة للمناهج الإلكترونية</p>
                    <p>نقلة للمناهج الإلكترونية</p>
                  </div>
                </div>
              )}

              {/* Sheet Header */}
              <div className="border-b-4 border-double border-green-300 pb-4 mb-6 z-10 flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-green-600 text-xs font-black">
                    <FileText className="w-4 h-4" />
                    <span>أوراق العمل التفاعلية - الصف الثالث الابتدائي</span>
                  </div>
                  <h2 className="text-xl font-black text-gray-800">مادة الرياضيات • ورقة العمل رقم ({pIdx + 1})</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">جمهورية السودان - وزارة التربية والتعليم</p>
                </div>
                {/* Logo placeholder */}
                <div className="text-left">
                  <p className="text-[10px] text-gray-400 font-bold font-mono">التاريخ: ___ / ___ / 2026 م</p>
                  <p className="text-[10px] text-gray-400 font-bold font-mono mt-1">الاسم: ___________________</p>
                </div>
              </div>

              {/* Questions Area */}
              <div className="flex-1 space-y-8 z-10">
                {page.map((q, qIdx) => (
                  <div key={q.id} className="space-y-3 pb-6 border-b border-dashed border-gray-100">
                    <h3 className="font-black text-base text-gray-800">
                      السؤال ({qIdx + 1}): <span className="font-sans font-bold">{q.text}</span>
                    </h3>

                    {/* True/False Lines */}
                    {q.type === 'true_false' && (
                      <div className="space-y-4 pr-4">
                        <div className="flex justify-between items-center text-sm font-bold text-gray-400">
                          <span>العبارة الأولى</span>
                          <span className="border-2 border-gray-200 rounded-lg px-4 py-1 font-mono text-xs">[    ]</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold text-gray-400">
                          <span>العبارة الثانية</span>
                          <span className="border-2 border-gray-200 rounded-lg px-4 py-1 font-mono text-xs">[    ]</span>
                        </div>
                      </div>
                    )}

                    {/* Fill Blank Lines */}
                    {q.type === 'fill_blank' && (
                      <div className="h-6"></div> // Blank space is already represented by points in question text
                    )}

                    {/* Matching Questions Representation */}
                    {q.type === 'matching' && q.leftItems && q.rightItems && (
                      <div className="grid grid-cols-2 gap-12 pt-2 pr-4 text-sm font-bold">
                        <div className="space-y-3">
                          <p className="text-xs text-gray-400 font-black">العمود (أ)</p>
                          {q.leftItems.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                              <span>{item}</span>
                              <span className="w-3.5 h-3.5 bg-green-500 rounded-full inline-block"></span>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-3">
                          <p className="text-xs text-gray-400 font-black">العمود (ب)</p>
                          {q.rightItems.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                              <span className="w-3.5 h-3.5 bg-green-500 rounded-full inline-block"></span>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Label Diagram Representation */}
                    {q.type === 'label_diagram' && q.labels && (
                      <div className="flex flex-col items-center gap-4 pt-2">
                        {/* Interactive or printable drawing */}
                        <div className="relative w-64 h-36 border border-gray-200 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden">
                          {q.diagramImg === 'abacus' ? (
                            <div className="flex gap-4">
                              <span className="w-1.5 h-20 bg-amber-800 rounded-full block relative">
                                <span className="absolute top-4 -left-1.5 w-4 h-4 bg-orange-500 rounded-full"></span>
                                <span className="absolute bottom-4 -left-1.5 w-4 h-4 bg-blue-500 rounded-full"></span>
                              </span>
                              <span className="w-1.5 h-20 bg-amber-800 rounded-full block relative">
                                <span className="absolute top-8 -left-1.5 w-4 h-4 bg-orange-500 rounded-full"></span>
                              </span>
                              <span className="w-1.5 h-20 bg-amber-800 rounded-full block relative"></span>
                            </div>
                          ) : q.diagramImg === 'fraction' ? (
                            <div className="flex flex-col items-center justify-center font-bold text-2xl text-purple-700">
                              <span>٣</span>
                              <span className="w-12 h-0.5 bg-purple-400 my-1"></span>
                              <span>٥</span>
                            </div>
                          ) : (
                            <div className="w-24 h-24 rounded-full border-4 border-orange-400 flex items-center justify-center relative">
                              {/* Clock hands */}
                              <span className="absolute w-1 h-8 bg-slate-800 origin-bottom bottom-12 rounded"></span>
                              <span className="absolute h-1 w-10 bg-blue-600 origin-left left-12 rounded"></span>
                              <span className="absolute w-2 h-2 bg-red-500 rounded-full"></span>
                            </div>
                          )}

                          {/* Points overlays */}
                          {q.labels.map(l => (
                            <span
                              key={l.id}
                              className="absolute bg-green-500 border border-white text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                              style={{ left: `${l.x}%`, top: `${l.y}%` }}
                            >
                              {l.id}
                            </span>
                          ))}
                        </div>

                        {/* Labels lines */}
                        <div className="grid grid-cols-2 gap-4 w-full max-w-sm text-xs font-bold text-gray-500">
                          {q.labels.map(l => (
                            <div key={l.id} className="flex items-center gap-2">
                              <span>({l.id})</span>
                              <span className="flex-1 border-b border-gray-200 border-dotted h-4"></span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Answers block at the bottom of the page if enabled */}
              {showAnswers && (
                <div className="mt-4 p-4 bg-green-50/50 border border-green-200 rounded-2xl z-10 text-xs font-sans text-green-800 leading-relaxed">
                  <h4 className="font-black text-green-900 mb-1 flex items-center gap-1">
                    <span>🔑</span> الإجابات النموذجية لورقة العمل {pIdx + 1}:
                  </h4>
                  <div className="space-y-1 pr-2">
                    {page.map((q, idx) => (
                      <p key={q.id}>
                        <strong className="font-bold">س ({idx + 1}):</strong> {q.correctAnswer}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Sheet Footer */}
              <div className="border-t border-gray-200 pt-3 mt-6 text-center text-[10px] text-gray-400 font-bold z-10 flex justify-between">
                <span>توليد تلقائي ذكي عبر منصة نقلة التعليمية 🎒</span>
                <span>الصفحة {pIdx + 1} من {pagesCount}</span>
                <span>علامة مائية موثقة للمناهج الإلكترونية</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
