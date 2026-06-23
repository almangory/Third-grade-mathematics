import { Lesson, Unit, UserProfile } from '../types';
import { ArrowRight, Heart, Play, Star, BookOpen, Volume2, HelpCircle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

interface LessonViewProps {
  lesson: Lesson;
  unit: Unit;
  user: UserProfile;
  favorites: string[];
  toggleFavorite: (lessonId: string) => void;
  onBack: () => void;
  onComplete: (lessonId: string) => void;
  onNextLesson?: () => void;
  onPrevLesson?: () => void;
  onStartQuiz: (scope: { type: 'lesson' | 'unit'; id: string; title: string }) => void;
}

export default function LessonView({
  lesson,
  unit,
  user,
  favorites,
  toggleFavorite,
  onBack,
  onComplete,
  onNextLesson,
  onPrevLesson,
  onStartQuiz
}: LessonViewProps) {
  const isFavorite = favorites.includes(lesson.id);
  const isCompleted = user.completedLessons.includes(lesson.id);

  // States for interactive tools
  const [abacusBeads, setAbacusBeads] = useState<number[]>([1, 5, 1, 0]); // thousands, hundreds, tens, ones
  const [abacusInput, setAbacusInput] = useState<string>('1510');
  const [clockTime, setClockTime] = useState({ hour: 3, minute: 0 });
  const [selectedMultiplier, setSelectedMultiplier] = useState<number>(7);
  const [multiplyAnswer, setMultiplyAnswer] = useState<string>('');
  const [multiplyCorrect, setMultiplyAnswerCorrect] = useState<boolean | null>(null);
  const [fractionCircleParts, setFractionCircleParts] = useState<number>(4);
  const [fractionCircleColored, setFractionCircleColored] = useState<number>(1);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  // Voice Command Assistant State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceText, setVoiceText] = useState<string>('');
  const [voiceSupported, setVoiceSupported] = useState<boolean>(true);

  // Check speech recognition support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
    }
  }, []);

  // Update abacus input when beads change
  useEffect(() => {
    const val = abacusBeads.reduce((acc, digit, idx) => acc + digit * Math.pow(10, 3 - idx), 0);
    setAbacusInput(val.toString().padStart(4, '0'));
  }, [abacusBeads]);

  // Handler for text-to-speech for children
  const handleReadText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Start voice listening
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-SA';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceText('أنا أستمع إليك الآن... تكلّم يا بطل 🎙️');
      };

      recognition.onerror = (event: any) => {
        console.error('Speech error', event);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setVoiceText('مرحباً! يرجى السماح للميكروفون بسماع أوامرك الصوتية.');
        } else {
          setVoiceText('عذراً، لم أستطع سماعك بوضوح. حاول مجدداً!');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const command = event.results[0][0].transcript.toLowerCase().trim();
        setVoiceText(`سمعتك تقول: "${command}"`);

        // Clean & process Arabic synonyms
        if (command.includes('تالي') || command.includes('بعده') || command.includes('الصفحة التالية') || command.includes('next')) {
          if (onNextLesson) {
            handleReadText("حسناً، الدرس التالي");
            onNextLesson();
          } else {
            handleReadText("أنت الآن في الدرس الأخير من هذه الوحدة!");
          }
        } else if (command.includes('سابق') || command.includes('قبله') || command.includes('الصفحة السابقة') || command.includes('previous')) {
          if (onPrevLesson) {
            handleReadText("حسناً، الدرس السابق");
            onPrevLesson();
          } else {
            handleReadText("أنت في الدرس الأول بالفعل!");
          }
        } else if (command.includes('مساعدة') || command.includes('ساعدني') || command.includes('طلب مساعدة') || command.includes('help')) {
          handleReadText("أهلاً بك يا بطل! أنا مساعدك الصوتي الذكي. يمكنك التحدث معي لإدارة صفحة الدرس. قل: 'التالي' للذهاب للأمام، أو 'السابق' للرجوع للخلف، أو قل: 'شرح الدرس' لسماعي وأنا أقرأ لك الشرح بصوتي، أو قل: 'ابدأ الاختبار' لبدء التحدي والمسابقات المسلية!");
        } else if (command.includes('قراءة') || command.includes('شرح') || command.includes('اقرأ') || command.includes('صوت')) {
          handleReadText(lesson.content);
        } else if (command.includes('رجوع') || command.includes('العودة') || command.includes('خروج') || command.includes('الخلف')) {
          handleReadText("حسناً، العودة إلى القائمة الرئيسية");
          onBack();
        } else if (command.includes('اختبار') || command.includes('حل') || command.includes('تحدي') || command.includes('امتحان')) {
          handleReadText("رائع! لنبدأ الاختبار التفاعلي لهذا الدرس.");
          onStartQuiz({ type: 'lesson', id: lesson.id, title: lesson.title });
        } else {
          handleReadText(`لقد سمعتك تقول: ${command}. جرب قول: التالي، السابق، شرح، أو مساعدة لخدمتك.`);
        }
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  // Check abacus number guess
  const checkAbacusValue = () => {
    const num = parseInt(abacusInput);
    if (isNaN(num)) return;
    setFeedbackMsg(`أحسنت! هذا يمثل العدد ${num} بالرموز المعدادية.`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 font-sans space-y-6" dir="rtl" id="lesson-view-container">
      {/* Top action bar */}
      <div className="flex flex-wrap justify-between items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700 font-bold rounded-xl transition-all cursor-pointer"
        >
          <ArrowRight className="w-5 h-5 text-amber-500" />
          <span>رجوع للمنهج</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Navigation between lessons */}
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
            <button
              onClick={onPrevLesson}
              disabled={!onPrevLesson}
              title="الدرس السابق"
              className="p-1.5 rounded-lg text-gray-500 hover:bg-white hover:text-amber-500 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <span className="text-xs text-gray-400 font-bold px-1.5">الدروس</span>
            <button
              onClick={onNextLesson}
              disabled={!onNextLesson}
              title="الدرس التالي"
              className="p-1.5 rounded-lg text-gray-500 hover:bg-white hover:text-amber-500 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => toggleFavorite(lesson.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-bold cursor-pointer ${
              isFavorite
                ? 'bg-red-50 text-red-600 border-red-200'
                : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-100'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            <span>{isFavorite ? 'في المفضلة' : 'أضف للمفضلة'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Description and Interactive Elements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lesson Description (Style of Textbook) */}
        <div className="col-span-1 lg:col-span-7 bg-white rounded-3xl p-6 shadow-md border-b-4 border-gray-100 space-y-6">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">{unit.title}</span>
              <h2 className="text-2xl font-black text-gray-800 leading-tight">{lesson.title}</h2>
            </div>
            <button
              onClick={() => handleReadText(lesson.content)}
              className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-colors shadow-sm cursor-pointer"
              title="استمع إلى شرح الدرس"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* Voice Command Assistant Box */}
          <div className="bg-amber-50/60 border-2 border-dashed border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3 justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={startListening}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200'
                    : 'bg-amber-400 text-amber-950 hover:bg-amber-500 hover:scale-105 active:scale-95'
                }`}
                title="اضغط وتحدث معي بالأوامر الصوتية"
              >
                <span className="text-lg">🎙️</span>
              </button>
              <div className="text-right">
                <h4 className="text-xs font-black text-amber-950">المساعد الصوتي للدرس (تحدّث معي):</h4>
                <p className="text-[11px] text-gray-600 font-bold leading-relaxed">
                  {voiceText || "اضغط على الميكروفون وتحدث معي! جرب: 'التالي'، 'السابق'، 'مساعدة'، أو 'اقرأ لي'."}
                </p>
              </div>
            </div>
            {!voiceSupported && (
              <span className="text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded-lg font-bold">المتصفح لا يدعم الميكروفون</span>
            )}
            {voiceSupported && !isListening && (
              <span className="text-[9px] text-amber-600 font-black bg-amber-100/50 px-2.5 py-1 rounded-full uppercase tracking-wider animate-bounce">اضغط لتتحدث 🗣️</span>
            )}
          </div>

          {/* Lesson Content Box */}
          <div className="bg-[#FFFDF6] border-2 border-yellow-100 rounded-2xl p-5 leading-relaxed text-gray-700 text-base font-sans whitespace-pre-wrap relative overflow-hidden">
            {lesson.content}
            <div className="absolute -bottom-8 -left-8 text-8xl opacity-5 pointer-events-none select-none">📖</div>
          </div>

          {/* Step-by-Step Box */}
          {lesson.steps && (
            <div className="space-y-3">
              <h4 className="font-black text-gray-800 text-lg flex items-center gap-1.5">
                <span className="w-2.5 h-6 bg-amber-400 rounded-full inline-block"></span>
                خطوات الحل المعتمدة (طريقتنا البسيطة):
              </h4>
              <ol className="grid grid-cols-1 gap-2.5">
                {lesson.steps.map((step, idx) => (
                  <li
                    key={idx}
                    className="flex gap-3 bg-gray-50 hover:bg-amber-50/30 p-3.5 border border-gray-100 rounded-xl transition-all"
                  >
                    <span className="w-6 h-6 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-gray-600 font-sans font-medium">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Actions at bottom of details */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => onComplete(lesson.id)}
              className={`flex-1 py-3 px-5 rounded-2xl font-black flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md ${
                isCompleted
                  ? 'bg-green-100 text-green-700 border-2 border-green-200 hover:bg-green-200'
                  : 'bg-green-500 text-white hover:bg-green-600 hover:shadow-lg active:scale-95'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{isCompleted ? 'لقد أنجزت هذا الدرس بنجاح! علم كغير منجز' : 'تحديد الدرس كمنجز واكتساب 50 نقطة 🌟'}</span>
            </button>

            <button
              onClick={() => onStartQuiz({ type: 'lesson', id: lesson.id, title: lesson.title })}
              className="py-3 px-6 bg-gradient-to-l from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-black rounded-2xl shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <HelpCircle className="w-5 h-5" />
              <span>اختبر نفسي في هذا الدرس 📝</span>
            </button>
          </div>
        </div>

        {/* Interactive Sandbox Tool Area */}
        <div className="col-span-1 lg:col-span-5 bg-white rounded-3xl p-6 shadow-md border-b-4 border-gray-100 flex flex-col justify-between">
          <div className="space-y-4 w-full">
            <div className="pb-3 border-b border-gray-100 flex items-center gap-2">
              <span className="text-lg">🛠️</span>
              <h3 className="text-lg font-black text-gray-800">الأداة التفاعلية لتجربة الشرح:</h3>
            </div>

            {/* ABACUS INTERACTIVE TOOL */}
            {lesson.id.startsWith('1') || lesson.interactiveType === 'abacus' ? (
              <div className="space-y-4">
                <p className="text-xs text-gray-500 font-bold leading-relaxed">
                  هذا هو <strong>المعداد السحري</strong> التفاعلي. انقر على خيوط المعداد لإضافة خرزات وقراءة الأرقام الحقيقية الممثلة لآحاد وعشرات ومئات وآلاف الأعداد!
                </p>

                {/* Simulated Abacus Graphic */}
                <div className="bg-[#FAF8F0] border-2 border-amber-100 rounded-2xl p-4 flex flex-col items-center shadow-inner relative">
                  <div className="w-full flex justify-around mb-2">
                    {['ألوف', 'مئات', 'عشرات', 'آحاد'].map((label, i) => (
                      <span key={i} className="text-xs font-black text-gray-600 font-sans bg-white border border-yellow-100 px-2 py-0.5 rounded-full shadow-sm">
                        {label}
                      </span>
                    ))}
                  </div>

                  <div className="w-full h-48 bg-white border-4 border-amber-900 rounded-xl flex justify-around p-1 relative shadow-sm overflow-hidden">
                    {/* Horizontal Abacus separator */}
                    <div className="absolute top-12 left-0 right-0 h-2 bg-amber-800 z-10"></div>

                    {/* Columns */}
                    {[0, 1, 2, 3].map((colIdx) => {
                      const value = abacusBeads[colIdx];
                      return (
                        <div
                          key={colIdx}
                          onClick={() => {
                            const newBeads = [...abacusBeads];
                            newBeads[colIdx] = (newBeads[colIdx] + 1) % 10;
                            setAbacusBeads(newBeads);
                          }}
                          className="w-8 h-full bg-amber-100 border-l border-r border-amber-300 relative flex flex-col items-center cursor-pointer hover:bg-amber-200/50 transition-colors"
                        >
                          {/* Top Bead (represents 5 if upper value, or standard counter for simplicity) */}
                          <div
                            className="absolute bg-orange-500 h-5 w-7 rounded-full border border-orange-600 transition-all shadow-md"
                            style={{ top: value >= 5 ? '4px' : '20px' }}
                          ></div>

                          {/* Lower Beads (0 to 4) */}
                          <div className="absolute bottom-1 w-full flex flex-col items-center gap-0.5">
                            {Array.from({ length: value % 5 }).map((_, beadIdx) => (
                              <div
                                key={beadIdx}
                                className="bg-blue-500 h-4 w-7 rounded-full border border-blue-600 shadow-sm"
                              ></div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Beads display values */}
                  <div className="w-full flex justify-around mt-4 font-mono font-black text-lg text-amber-700">
                    {abacusBeads.map((bead, i) => (
                      <span key={i} className="bg-amber-100/50 w-8 h-8 rounded-lg flex items-center justify-center">
                        {bead}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Check Guess */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={abacusInput}
                    onChange={(e) => setAbacusInput(e.target.value)}
                    className="flex-1 p-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-center font-mono font-bold outline-none focus:border-amber-400"
                    placeholder="اقرأ العدد من المعداد واكتبه هنا"
                  />
                  <button
                    onClick={checkAbacusValue}
                    className="px-4 bg-amber-400 text-amber-950 font-black rounded-xl hover:bg-amber-500 shadow-sm cursor-pointer"
                  >
                    تأكيد
                  </button>
                </div>
              </div>
            ) : lesson.id.startsWith('u2') || lesson.interactiveType === 'multiplication-table' ? (
              /* MULTIPLICATION INTERACTIVE TOOL */
              <div className="space-y-4">
                <p className="text-xs text-gray-500 font-bold leading-relaxed">
                  هيا نتدرب على <strong>حقائق جدول الضرب للعدد {selectedMultiplier}</strong>! اختر الرقم لترى ناتج الضرب وتفهمه كجمع متكرر.
                </p>

                <div className="flex gap-2 justify-center flex-wrap">
                  {[7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => setInteractiveData({ multiplier: num })}
                      className={`px-3 py-1.5 rounded-xl font-bold text-sm ${
                        multiplierValue() === num ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      جدول {num}
                    </button>
                  ))}
                </div>

                <div class="bg-blue-50 p-4 rounded-2xl border-2 border-blue-100">
                  <div class="grid grid-cols-5 gap-2 text-center text-sm">
                    {Array.from({ length: 10 }).map((_, i) => {
                      const multiplicand = i + 1;
                      const mul = multiplierValue();
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            setMultiplyAnswer('');
                            setMultiplyAnswerCorrect(null);
                            setFeedbackMsg(`${mul} × ${multiplicand} = ${mul * multiplicand}\nمكرر ${multiplicand} مرات: ${Array(multiplicand).fill(mul).join(' + ')}`);
                          }}
                          className="p-2 bg-white hover:bg-blue-100 border border-blue-100 rounded-xl transition-colors font-bold text-blue-800"
                        >
                          {mul} × {multiplicand}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : lesson.id.startsWith('u4') || lesson.interactiveType === 'fraction-circle' ? (
              /* FRACTIONS INTERACTIVE TOOL */
              <div className="space-y-4">
                <p className="text-xs text-gray-500 font-bold leading-relaxed">
                  هذا هو <strong>قرص الكسور التفاعلي</strong>. تحكم بعدد الأجزاء المتطابقة للدائرة وعدد الأجزاء الملونة لترى تمثيل الكسر ومفهوم البسط والمقام!
                </p>

                <div className="flex gap-4 items-center">
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500">عدد الأجزاء الكلي (المقام):</label>
                    <input
                      type="range"
                      min="2"
                      max="12"
                      value={fractionCircleParts}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setFractionCircleParts(val);
                        if (fractionCircleColored > val) setFractionCircleColored(val);
                      }}
                      className="accent-purple-500 h-2 bg-gray-200 rounded-lg cursor-pointer"
                    />
                  </div>
                  <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded-lg">
                    {fractionCircleParts}
                  </span>
                </div>

                <div className="flex gap-4 items-center">
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500">الأجزاء الملونة (البسط):</label>
                    <input
                      type="range"
                      min="1"
                      max={fractionCircleParts}
                      value={fractionCircleColored}
                      onChange={(e) => setFractionCircleColored(parseInt(e.target.value))}
                      className="accent-purple-500 h-2 bg-gray-200 rounded-lg cursor-pointer"
                    />
                  </div>
                  <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded-lg">
                    {fractionCircleColored}
                  </span>
                </div>

                {/* SVG Pizza Fraction Representation */}
                <div className="flex justify-center p-3">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="2" />
                    {Array.from({ length: fractionCircleParts }).map((_, i) => {
                      const angle = 360 / fractionCircleParts;
                      const startAngle = i * angle;
                      const endAngle = (i + 1) * angle;

                      const rad = Math.PI / 180;
                      const x1 = 50 + 45 * Math.cos(startAngle * rad);
                      const y1 = 50 + 45 * Math.sin(startAngle * rad);
                      const x2 = 50 + 45 * Math.cos(endAngle * rad);
                      const y2 = 50 + 45 * Math.sin(endAngle * rad);

                      const largeArcFlag = angle > 180 ? 1 : 0;
                      const pathData = `M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                      const isColored = i < fractionCircleColored;

                      return (
                        <path
                          key={i}
                          d={pathData}
                          fill={isColored ? '#EC4899' : 'none'}
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                      );
                    })}
                  </svg>
                </div>

                {/* Fraction symbol */}
                <div className="flex flex-col items-center">
                  <div className="flex flex-col items-center justify-center border-2 border-purple-200 bg-purple-50 px-4 py-2 rounded-xl">
                    <span className="text-xl font-black text-purple-800 font-mono">{fractionCircleColored}</span>
                    <div className="w-10 h-0.5 bg-purple-400 my-1"></div>
                    <span className="text-xl font-black text-purple-800 font-mono">{fractionCircleParts}</span>
                  </div>
                  <p className="text-xs text-purple-600 font-bold mt-2">
                    الكسر هو: {fractionCircleColored} من {fractionCircleParts}
                  </p>
                </div>
              </div>
            ) : (
              /* GENERIC OR CLOCK INTERACTIVE TOOL */
              <div className="space-y-4">
                <p className="text-xs text-gray-500 font-bold leading-relaxed">
                  هذا هو <strong>مخطط القياس والهندسة</strong> التفاعلي. تحكم بعقارب الساعة أو تعرف على أجزاء الدقائق والساعات!
                </p>

                {/* Interactive Clock */}
                <div className="flex flex-col items-center gap-4 bg-[#F8FAFC] border-2 border-orange-100 rounded-2xl p-4">
                  {/* Clock face SVG */}
                  <svg className="w-32 h-32" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="white" stroke="#F97316" strokeWidth="4" />
                    {/* Hour markings */}
                    {Array.from({ length: 12 }).map((_, i) => {
                      const angle = (i * 30) * (Math.PI / 180);
                      const x1 = 50 + 38 * Math.sin(angle);
                      const y1 = 50 - 38 * Math.cos(angle);
                      const x2 = 50 + 42 * Math.sin(angle);
                      const y2 = 50 - 42 * Math.cos(angle);
                      return (
                        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f97316" strokeWidth="2" />
                      );
                    })}

                    {/* Clock Hands */}
                    {/* Hour Hand */}
                    <line
                      x1="50"
                      y1="50"
                      x2={50 + 22 * Math.sin((clockTime.hour * 30 + clockTime.minute * 0.5) * (Math.PI / 180))}
                      y2={50 - 22 * Math.cos((clockTime.hour * 30 + clockTime.minute * 0.5) * (Math.PI / 180))}
                      stroke="#1e293b"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    {/* Minute Hand */}
                    <line
                      x1="50"
                      y1="50"
                      x2={50 + 32 * Math.sin((clockTime.minute * 6) * (Math.PI / 180))}
                      y2={50 - 32 * Math.cos((clockTime.minute * 6) * (Math.PI / 180))}
                      stroke="#3b82f6"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {/* Center point */}
                    <circle cx="50" cy="50" r="3" fill="#ef4444" />
                  </svg>

                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-gray-500">الساعات</span>
                      <div className="flex gap-1 items-center mt-1">
                        <button
                          onClick={() => setClockTime(prev => ({ ...prev, hour: prev.hour === 1 ? 12 : prev.hour - 1 }))}
                          className="w-7 h-7 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold shrink-0"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold text-sm bg-white p-1 border rounded-lg">{clockTime.hour}</span>
                        <button
                          onClick={() => setClockTime(prev => ({ ...prev, hour: prev.hour === 12 ? 1 : prev.hour + 1 }))}
                          className="w-7 h-7 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold shrink-0"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-gray-500">الدقائق</span>
                      <div className="flex gap-1 items-center mt-1">
                        <button
                          onClick={() => setClockTime(prev => ({ ...prev, minute: prev.minute === 0 ? 55 : prev.minute - 5 }))}
                          className="w-7 h-7 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold shrink-0"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold text-sm bg-white p-1 border rounded-lg">{clockTime.minute}</span>
                        <button
                          onClick={() => setClockTime(prev => ({ ...prev, minute: prev.minute === 55 ? 0 : prev.minute + 5 }))}
                          className="w-7 h-7 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold shrink-0"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm font-black text-slate-700 bg-white border border-slate-100 px-4 py-2 rounded-xl shadow-sm">
                    الوقت: {clockTime.hour}:{clockTime.minute.toString().padStart(2, '0')}
                  </p>
                </div>
              </div>
            )}

            {/* General Feedback Box */}
            {feedbackMsg && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-xs font-sans font-bold leading-relaxed text-yellow-800 whitespace-pre-line"
              >
                {feedbackMsg}
              </motion.div>
            )}
          </div>

          <div className="mt-6 p-4 bg-orange-50 border border-orange-100 rounded-2xl">
            <h4 className="text-xs font-black text-orange-700 mb-1 flex items-center gap-1">
              <span>💡</span> نصيحة ذكية للتعلم:
            </h4>
            <p className="text-xs text-orange-600/90 leading-relaxed font-medium">
              العب بالأداة السحرية في الأعلى لتفهم الدرس عملياً، ثم ابدأ في حل الأسئلة لتجمع الأوسمة وتثبت جدارتك كبطل ذكي!
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  function multiplierValue(): number {
    if (selectedMultiplier) return selectedMultiplier;
    if (lesson.interactiveData && typeof lesson.interactiveData.multiplier === 'number') {
      return lesson.interactiveData.multiplier;
    }
    return 7;
  }

  function setInteractiveData(data: { multiplier: number }) {
    setSelectedMultiplier(data.multiplier);
  }
}
