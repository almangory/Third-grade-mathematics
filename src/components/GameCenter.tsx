import { UserProfile } from '../types';
import { Sparkles, Gamepad2, Star, Award, Zap, CheckCircle, RefreshCw, Trophy, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

interface GameCenterProps {
  user: UserProfile;
  onAwardPoints: (points: number) => void;
}

export default function GameCenter({ user, onAwardPoints }: GameCenterProps) {
  const [activeGame, setActiveGame] = useState<'abacus' | 'race' | 'pizza' | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [score, setScore] = useState<number>(0);
  const [targetValue, setTargetValue] = useState<any>(null);
  const [choices, setChoices] = useState<any[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  // General restart or back to lobby
  const handleBackToLobby = () => {
    setActiveGame(null);
    setGameState('idle');
    setScore(0);
    setStreak(0);
    setFeedback(null);
  };

  // --- GAME 1: FAST MULTIPLIER RACE ENGINE ---
  const startRaceGame = () => {
    setScore(0);
    setStreak(0);
    setFeedback(null);
    setGameState('playing');
    generateRaceQuestion();
  };

  const generateRaceQuestion = () => {
    const multipliers = [7, 8, 9];
    const mul = multipliers[Math.floor(Math.random() * multipliers.length)];
    const num = Math.floor(Math.random() * 9) + 1; // 1 to 9
    const correctAns = mul * num;

    // Generate choices
    const wrongAnswers = new Set<number>();
    while (wrongAnswers.size < 3) {
      const offset = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const fake = correctAns + offset;
      if (fake > 0 && fake !== correctAns) wrongAnswers.add(fake);
    }

    const allChoices = [correctAns, ...Array.from(wrongAnswers)].sort(() => 0.5 - Math.random());

    setTargetValue({ mul, num, correctAns });
    setChoices(allChoices);
    setFeedback(null);
  };

  const handleRaceAnswer = (chosen: number) => {
    const isCorrect = chosen === targetValue.correctAns;
    if (isCorrect) {
      setScore(prev => prev + 10);
      setStreak(prev => prev + 1);
      setFeedback({ isCorrect: true, text: 'رائع جداً! سيارتك تندفع بسرعة مذهلة! 🚗💨' });
      onAwardPoints(10);
    } else {
      setStreak(0);
      setFeedback({ isCorrect: false, text: `خطأ بسيط، الإجابة الصحيحة هي ${targetValue.correctAns}` });
    }

    setTimeout(() => {
      if (score >= 50) {
        setGameState('ended');
      } else {
        generateRaceQuestion();
      }
    }, 1200);
  };

  // --- GAME 2: PIZZA FRACTIONS MATCH ENGINE ---
  const [pizzaParts, setPizzaParts] = useState<number>(4);
  const [pizzaColored, setPizzaColored] = useState<number>(0);

  const startPizzaGame = () => {
    setScore(0);
    setStreak(0);
    setFeedback(null);
    setGameState('playing');
    generatePizzaQuestion();
  };

  const generatePizzaQuestion = () => {
    const parts = [3, 4, 5, 6, 8][Math.floor(Math.random() * 5)];
    const colored = Math.floor(Math.random() * (parts - 1)) + 1; // 1 to parts-1
    setPizzaParts(parts);
    setPizzaColored(0); // student must click to color
    setTargetValue({ parts, colored });
    setFeedback(null);
  };

  const checkPizzaAnswer = () => {
    const isCorrect = pizzaColored === targetValue.colored;
    if (isCorrect) {
      setScore(prev => prev + 15);
      setStreak(prev => prev + 1);
      setFeedback({ isCorrect: true, text: 'عبقري! تطابق الكسر تماماً مع البيتزا اللذيذة! 🍕🎉' });
      onAwardPoints(15);
    } else {
      setStreak(0);
      setFeedback({ isCorrect: false, text: `تأكد من تلوين ${targetValue.colored} أجزاء من أصل ${targetValue.parts}!` });
    }

    setTimeout(() => {
      if (score >= 45) {
        setGameState('ended');
      } else {
        generatePizzaQuestion();
      }
    }, 1500);
  };

  // --- GAME 3: THE MAGIC ABACUS ---
  const [studentBeads, setStudentBeads] = useState<number[]>([0, 0, 0, 0]);

  const startAbacusGame = () => {
    setScore(0);
    setStreak(0);
    setFeedback(null);
    setGameState('playing');
    generateAbacusQuestion();
  };

  const generateAbacusQuestion = () => {
    const randValue = Math.floor(Math.random() * 8999) + 1000; // 1000 to 9999
    setTargetValue(randValue);
    setStudentBeads([0, 0, 0, 0]);
    setFeedback(null);
  };

  const checkAbacusAnswer = () => {
    const abacusSum = studentBeads.reduce((acc, digit, idx) => acc + digit * Math.pow(10, 3 - idx), 0);
    const isCorrect = abacusSum === targetValue;

    if (isCorrect) {
      setScore(prev => prev + 20);
      setStreak(prev => prev + 1);
      setFeedback({ isCorrect: true, text: 'بطل حقيقي! مثلت المعداد والخرزات بدقة خارقة! 🏅✨' });
      onAwardPoints(20);
    } else {
      setFeedback({ isCorrect: false, text: `مجموع خرزاتك هو ${abacusSum}، والمطلوب تمثيل ${targetValue}!` });
    }

    setTimeout(() => {
      if (score >= 40) {
        setGameState('ended');
      } else {
        generateAbacusQuestion();
      }
    }, 1500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 font-sans space-y-6" dir="rtl" id="game-center-container">
      {/* Game Center Intro Header */}
      {activeGame === null && (
        <div className="bg-gradient-to-l from-purple-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-2 left-2 text-8xl opacity-10">🎮</div>
          <div>
            <span className="text-xs uppercase bg-white/20 text-white px-2.5 py-1 rounded-full font-bold">ملعب الأبطال</span>
            <h1 className="text-2xl font-black mt-1 font-sans">مركز الألعاب الحسابية التفاعلي ⚡</h1>
            <p className="text-purple-100 text-xs font-bold mt-1">العب واجمع النقاط الذهبية لتفتح الأوسمة الجديدة وتنافس أصدقائك!</p>
          </div>
          <div className="flex gap-2">
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/10 text-center">
              <span className="text-xl">🏆</span>
              <p className="text-[10px] text-purple-200">النقاط</p>
              <p className="font-mono text-sm font-black">{user.points}</p>
            </div>
          </div>
        </div>
      )}

      {/* LOBBY / GAMES SELECTOR */}
      {activeGame === null && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Game 1 Card */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-white border-2 border-purple-100 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-3">
              <span className="text-4xl">🚗</span>
              <h3 className="text-lg font-black text-gray-800">سباق سيارات الضرب السريع</h3>
              <p className="text-gray-400 text-xs font-bold leading-relaxed">
                تحدى نفسك في جداول الضرب 7 و 8 و 9. كل إجابة صحيحة تطلق سيارتك للأمام لتفوز بالكأس الذهبية!
              </p>
            </div>
            <button
              onClick={() => {
                setActiveGame('race');
                startRaceGame();
              }}
              className="w-full mt-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-black rounded-2xl cursor-pointer shadow-md transition-colors"
            >
              ابدأ اللعب الآن 🎮
            </button>
          </motion.div>

          {/* Game 2 Card */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-white border-2 border-pink-100 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-3">
              <span className="text-4xl">🍕</span>
              <h3 className="text-lg font-black text-gray-800">تطابق الكسور والبيتزا اللذيذة</h3>
              <p className="text-gray-400 text-xs font-bold leading-relaxed">
                لون قطع البيتزا لتطابق الكسر المعروض تماماً. تعلم البسط والمقام بأشهى طريقة ممكنة!
              </p>
            </div>
            <button
              onClick={() => {
                setActiveGame('pizza');
                startPizzaGame();
              }}
              className="w-full mt-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-black rounded-2xl cursor-pointer shadow-md transition-colors"
            >
              ابدأ اللعب الآن 🎮
            </button>
          </motion.div>

          {/* Game 3 Card */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-white border-2 border-amber-100 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-3">
              <span className="text-4xl">🧮</span>
              <h3 className="text-lg font-black text-gray-800">تحدي خرزات العداد السحري</h3>
              <p className="text-gray-400 text-xs font-bold leading-relaxed">
                تظهر أعداد عشوائية وعليك تمثيل خرزات الآحاد والعشرات والمئات بدقة متناهية على المعداد لتكسب التحدي!
              </p>
            </div>
            <button
              onClick={() => {
                setActiveGame('abacus');
                startAbacusGame();
              }}
              className="w-full mt-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl cursor-pointer shadow-md transition-colors"
            >
              ابدأ اللعب الآن 🎮
            </button>
          </motion.div>
        </div>
      )}

      {/* ACTIVE GAME WINDOW CONTAINER */}
      {activeGame !== null && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 shadow-xl border-4 border-purple-200">
          {/* Game Header */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
            <button
              onClick={handleBackToLobby}
              className="text-xs bg-gray-100 hover:bg-gray-200 font-bold px-3 py-1.5 rounded-lg cursor-pointer"
            >
              ↩ مغادرة اللعبة
            </button>
            <div className="flex items-center gap-4 text-sm font-black text-slate-700">
              <span>🎯 النتيجة: {score}</span>
              <span>🔥 التوالي: {streak}</span>
            </div>
          </div>

          {/* GAMEPLAY WINDOW */}
          {gameState === 'playing' && targetValue && (
            <div className="space-y-6 text-center">
              {/* Game 1 view: Fast Multiplier Race */}
              {activeGame === 'race' && (
                <div className="space-y-6">
                  {/* Track Simulation */}
                  <div className="bg-[#FAF8F0] p-4 border border-yellow-200 rounded-2xl relative overflow-hidden shadow-inner h-24 flex items-center">
                    <div className="absolute right-0 left-0 border-t-2 border-dashed border-gray-300"></div>
                    <motion.div
                      animate={{ x: `${score * 4}px` }}
                      className="absolute right-4 text-4xl z-10 filter drop-shadow-md"
                    >
                      🚗
                    </motion.div>
                    <div className="absolute left-4 text-3xl">🏁</div>
                  </div>

                  <div className="bg-purple-50 p-4 border border-purple-100 rounded-2xl">
                    <p className="text-xs font-black text-purple-600">اضرب الأرقام بسرعة!</p>
                    <h3 className="text-3xl font-black text-purple-900 mt-2 font-mono">
                      {targetValue.mul} × {targetValue.num} = ؟
                    </h3>
                  </div>

                  {/* Multiplier Choices buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    {choices.map((choice) => (
                      <button
                        key={choice}
                        onClick={() => handleRaceAnswer(choice)}
                        className="p-4 bg-white hover:bg-purple-100 border-2 border-gray-100 hover:border-purple-300 rounded-2xl font-black text-lg text-purple-800 transition-all cursor-pointer font-mono"
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Game 2 view: Pizza Fraction Matches */}
              {activeGame === 'pizza' && (
                <div className="space-y-6">
                  <div className="bg-pink-50 border border-pink-100 p-4 rounded-2xl">
                    <p className="text-xs font-black text-pink-600">مثّل الكسر التالي بتلوين البيتزا:</p>
                    <div className="flex justify-center items-center gap-2 mt-2">
                      <span className="text-2xl font-black text-pink-800 font-mono">
                        {targetValue.colored} / {targetValue.parts}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Pizza Graphic */}
                  <div className="flex justify-center p-3 relative">
                    <svg className="w-40 h-30 transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="2" />
                      {Array.from({ length: pizzaParts }).map((_, i) => {
                        const angle = 360 / pizzaParts;
                        const startAngle = i * angle;
                        const endAngle = (i + 1) * angle;

                        const rad = Math.PI / 180;
                        const x1 = 50 + 45 * Math.cos(startAngle * rad);
                        const y1 = 50 + 45 * Math.sin(startAngle * rad);
                        const x2 = 50 + 45 * Math.cos(endAngle * rad);
                        const y2 = 50 + 45 * Math.sin(endAngle * rad);

                        const largeArcFlag = angle > 180 ? 1 : 0;
                        const pathData = `M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                        const isColored = i < pizzaColored;

                        return (
                          <path
                            key={i}
                            d={pathData}
                            fill={isColored ? '#EC4899' : '#fff9f9'}
                            stroke="#fcd34d"
                            strokeWidth="3.5"
                            className="cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => {
                              // Student colors piece-by-piece
                              setPizzaColored(i + 1);
                            }}
                          />
                        );
                      })}
                    </svg>
                  </div>

                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setPizzaColored(0)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      ↩ إعادة تعيين التلوين
                    </button>
                    <button
                      onClick={checkPizzaAnswer}
                      className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-black rounded-xl text-xs shadow-md cursor-pointer"
                    >
                      تأكيد ومطابقة الكسر ✅
                    </button>
                  </div>
                </div>
              )}

              {/* Game 3 view: Abacus Counter challenge */}
              {activeGame === 'abacus' && (
                <div className="space-y-6">
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
                    <p className="text-xs font-black text-amber-600">مثّل العدد التالي على المعداد السحري:</p>
                    <h3 className="text-3xl font-black text-amber-900 mt-2 font-mono">{targetValue}</h3>
                  </div>

                  {/* Interactively set beads */}
                  <div className="bg-white border-4 border-amber-800 rounded-3xl p-4 flex flex-col items-center shadow-inner relative max-w-sm mx-auto">
                    <div className="w-full flex justify-around mb-2">
                      {['ألوف', 'مئات', 'عشرات', 'آحاد'].map((label, i) => (
                        <span key={i} className="text-[10px] font-black text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                          {label}
                        </span>
                      ))}
                    </div>

                    <div className="w-full h-36 bg-amber-50/50 border-4 border-amber-950 rounded-xl flex justify-around p-1 relative shadow-sm overflow-hidden">
                      <div className="absolute top-10 left-0 right-0 h-1 bg-amber-800 z-10"></div>
                      {[0, 1, 2, 3].map((colIdx) => {
                        const val = studentBeads[colIdx];
                        return (
                          <div
                            key={colIdx}
                            onClick={() => {
                              const newBeads = [...studentBeads];
                              newBeads[colIdx] = (newBeads[colIdx] + 1) % 10;
                              setStudentBeads(newBeads);
                            }}
                            className="w-6 h-full bg-amber-100/50 border-l border-r border-amber-300 relative flex flex-col items-center cursor-pointer hover:bg-amber-200/50"
                          >
                            {/* Top bead */}
                            <div
                              className="absolute bg-orange-500 h-4 w-5 rounded-full border border-orange-600"
                              style={{ top: val >= 5 ? '2px' : '15px' }}
                            ></div>
                            {/* Bottom beads */}
                            <div className="absolute bottom-1 w-full flex flex-col items-center gap-0.5">
                              {Array.from({ length: val % 5 }).map((_, beadIdx) => (
                                <div
                                  key={beadIdx}
                                  className="bg-blue-500 h-3.5 w-5 rounded-full border border-blue-600"
                                ></div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Show current value */}
                    <div className="w-full flex justify-around mt-4 font-mono font-black text-lg text-amber-700">
                      {studentBeads.map((bead, i) => (
                        <span key={i} className="bg-amber-100/50 w-7 h-7 rounded-lg flex items-center justify-center text-sm">
                          {bead}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={checkAbacusAnswer}
                    className="w-full max-w-xs py-3 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl shadow-md cursor-pointer"
                  >
                    تأكيد تمثيل العدد ومطابقة المعداد 🏅
                  </button>
                </div>
              )}

              {/* Feedback messages */}
              <AnimatePresence mode="wait">
                {feedback && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className={`p-4 rounded-2xl text-sm font-black leading-relaxed ${
                      feedback.isCorrect ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-600'
                    }`}
                  >
                    {feedback.text}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* END OF GAME / SUCCESS SUMMARY SCREEN */}
          {gameState === 'ended' && (
            <div className="text-center space-y-6 py-6">
              <span className="text-6xl animate-bounce">🏆</span>
              <div>
                <h3 className="text-2xl font-black text-gray-800">عمل بطولي لا يصدق! 🎉</h3>
                <p className="text-gray-500 text-xs mt-1.5">لقد اجتزت التحدي بنجاح تام وسحقت الأرقام القياسية!</p>
              </div>

              <div className="bg-purple-50 max-w-sm mx-auto p-5 rounded-3xl border border-purple-100 text-right space-y-2">
                <p className="text-sm font-bold text-gray-600">
                  - اللعبة المنجزة: <strong className="text-purple-700">
                    {activeGame === 'race' ? 'سباق الضرب السريع' :
                     activeGame === 'pizza' ? 'مطابقة كسور البيتزا' : 'خرزات المعداد السحري'}
                  </strong>
                </p>
                <p className="text-sm font-bold text-gray-600">
                  - مجموع النقاط التي اكتسبتها: <strong className="text-green-600">+{score} نقطة 🌟</strong>
                </p>
                <p className="text-sm font-bold text-gray-600">
                  - أوسمة محتملة: <strong className="text-amber-500">وسام عبقري الألعاب الحسابية 🏅</strong>
                </p>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    if (activeGame === 'race') startRaceGame();
                    else if (activeGame === 'pizza') startPizzaGame();
                    else startAbacusGame();
                  }}
                  className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-black rounded-2xl shadow-md cursor-pointer transition-colors"
                >
                  العب مرة أخرى 🔄
                </button>
                <button
                  onClick={handleBackToLobby}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl cursor-pointer transition-colors"
                >
                  العودة للمركز ↩
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
