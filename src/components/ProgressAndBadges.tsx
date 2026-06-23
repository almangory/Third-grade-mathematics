import { UserProfile, QuizResult } from '../types';
import { Award, CheckCircle2, Shield, Calendar, BarChart2, Star, Sparkles, Printer, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

interface ProgressAndBadgesProps {
  user: UserProfile;
  reports: QuizResult[];
  onClearReports?: () => void;
}

export default function ProgressAndBadges({
  user,
  reports,
  onClearReports
}: ProgressAndBadgesProps) {
  const [selectedReport, setSelectedReport] = useState<QuizResult | null>(null);

  // Hardcoded Badge Database to show locked/unlocked system status
  const badgeDatabase = [
    { id: 'b1', title: 'وسام بطل المعداد 🧮', description: 'يُمنح عند قراءة وكتابة الأعداد ضمن 4 خانات بدقة.', icon: '🧮', color: 'bg-amber-100 border-amber-300 text-amber-800' },
    { id: 'b2', title: 'فارس جدول الضرب ⚔️', description: 'يُمنح عند إتقان جداول ضرب الأعداد 7 و 8 و 9 كاملة.', icon: '⚔️', color: 'bg-blue-100 border-blue-300 text-blue-800' },
    { id: 'b3', title: 'ملك الكسور 🍕', description: 'يُمنح عند إتقان جمع وطرح ومقارنة الكسور متساوية المقامات.', icon: '🍕', color: 'bg-pink-100 border-pink-300 text-pink-800' },
    { id: 'b4', title: 'سيد الوقت والقياس ⏱️', description: 'يُمنح عند تمثيل عقارب الساعات والدقائق وفهم أجزائها.', icon: '⏱️', color: 'bg-orange-100 border-orange-300 text-orange-800' },
    { id: 'b5', title: 'مهندس المستقبل 📐', description: 'يُمنح عند قياس أطوال القطع وتحديد خصائص المثلث والمربع.', icon: '📐', color: 'bg-purple-100 border-purple-300 text-purple-800' }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 font-sans space-y-8 animate-fade-in" dir="rtl" id="progress-badges-container">
      {/* Upper overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3.5 bg-yellow-100 text-yellow-600 rounded-2xl text-xl">⭐</div>
          <div>
            <p className="text-xs text-gray-400 font-bold">النقاط الكلية</p>
            <p className="text-xl font-black font-mono text-gray-800">{user.points} نقطة</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3.5 bg-green-100 text-green-600 rounded-2xl text-xl">🏅</div>
          <div>
            <p className="text-xs text-gray-400 font-bold">الأوسمة المحصلة</p>
            <p className="text-xl font-black font-mono text-gray-800">{user.badges.length} / {badgeDatabase.length} أوسمة</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3.5 bg-blue-100 text-blue-600 rounded-2xl text-xl">📝</div>
          <div>
            <p className="text-xs text-gray-400 font-bold">الاختبارات المنجزة</p>
            <p className="text-xl font-black font-mono text-gray-800">{reports.length} اختباراً</p>
          </div>
        </div>
      </div>

      {/* Badges system showcase */}
      <section className="bg-white rounded-3xl p-6 shadow-md border-b-4 border-gray-100 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>لوحة الأوسمة الذهبية للابطال</span>
          </h3>
          <span className="text-xs text-gray-400 font-bold">تفتح الأوسمة تلقائياً بزيادة النقاط وحل الوحدات</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {badgeDatabase.map((badge) => {
            const isUnlocked = user.badges.some(b => b.id === badge.id);
            return (
              <motion.div
                key={badge.id}
                whileHover={isUnlocked ? { scale: 1.02 } : {}}
                className={`p-4 rounded-2xl border-2 flex gap-4 items-center transition-all ${
                  isUnlocked
                    ? `${badge.color} shadow-sm cursor-help`
                    : 'bg-gray-50 border-gray-100 opacity-60 filter grayscale'
                }`}
                title={badge.description}
              >
                <div className="text-3xl shrink-0">{badge.icon}</div>
                <div className="space-y-1">
                  <h4 className="font-black text-sm">{badge.title}</h4>
                  <p className="text-[11px] text-gray-500 font-bold leading-relaxed">{badge.description}</p>
                  <span className="text-[10px] font-black block mt-1">
                    {isUnlocked ? '🔓 تم الفتح واستلام الجائزة! ✅' : '🔒 مغلق حتى إتمام دروس الوحدة'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Reports and past quiz analytical records */}
      <section className="bg-white rounded-3xl p-6 shadow-md border-b-4 border-gray-100 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100 flex-wrap gap-3">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-500" />
            <span>سجل تقارير الأداء المحفوظة ({reports.length})</span>
          </h3>
          {reports.length > 0 && onClearReports && (
            <button
              onClick={onClearReports}
              className="text-xs text-red-500 hover:text-red-600 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>مسح جميع التقارير</span>
            </button>
          )}
        </div>

        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200 text-center">
            <span className="text-4xl mb-2">📊</span>
            <p className="text-sm font-bold text-gray-500">لا توجد تقارير محفوظة حتى الآن!</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              ابدأ في حل الاختبارات التفاعلية للدروس أو الوحدات لتظهر التقارير والأداء والتحاليل هنا تلقائياً.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* List on the right (RTL: right side is right) */}
            <div className="lg:col-span-5 space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {reports.map((report) => {
                const isSelected = selectedReport?.quizId === report.quizId;
                return (
                  <button
                    key={report.quizId}
                    onClick={() => setSelectedReport(report)}
                    className={`w-full p-4 rounded-2xl text-right transition-all border-2 flex justify-between items-center cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/30'
                        : 'border-gray-100 hover:border-indigo-200 bg-white shadow-sm'
                    }`}
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-gray-800 leading-tight">{report.title}</h4>
                      <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span>{report.date}</span>
                      </p>
                    </div>

                    <div className="text-left font-mono shrink-0">
                      <span className="text-lg font-black text-indigo-600">{report.percentage}%</span>
                      <p className="text-[10px] text-gray-400 font-bold">نسبة النجاح</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected report detail view on the left */}
            <div className="lg:col-span-7 bg-[#FAF9F5] border border-gray-200/50 rounded-2xl p-5 space-y-4">
              {selectedReport ? (
                <div className="space-y-4 text-right">
                  <div className="flex justify-between items-start pb-3 border-b border-gray-200 flex-wrap gap-2">
                    <div>
                      <h4 className="font-black text-gray-800 text-sm">{selectedReport.title}</h4>
                      <p className="text-[10px] text-gray-400 font-bold mt-0.5">تاريخ الاختبار: {selectedReport.date}</p>
                    </div>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-black">
                      درجة الإتقان: {selectedReport.percentage}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-bold text-gray-600">
                    <p>- الأسئلة الصحيحة: <strong className="text-green-600">{selectedReport.correctAnswers}</strong></p>
                    <p>- الأسئلة الخاطئة: <strong className="text-red-500">{selectedReport.wrongAnswers}</strong></p>
                    <p>- النقاط المكتسبة: <strong className="text-amber-600">+{selectedReport.score} 🌟</strong></p>
                    <p>- زمن الحل: <strong className="text-indigo-600">{Math.floor(selectedReport.timeSpentSeconds / 60)} د و {selectedReport.timeSpentSeconds % 60} ث</strong></p>
                  </div>

                  <div className="p-3 bg-white border border-gray-100 rounded-xl space-y-2 text-xs">
                    <p className="font-black text-green-800">💪 نقاط القوة المكتشفة:</p>
                    <p className="text-gray-500 leading-relaxed font-sans">{selectedReport.performanceAnalysis.strength}</p>
                  </div>

                  <div className="p-3 bg-white border border-gray-100 rounded-xl space-y-2 text-xs">
                    <p className="font-black text-indigo-800">📚 التوصية التعليمية الذكية للتحسن:</p>
                    <p className="text-gray-500 leading-relaxed font-sans">{selectedReport.performanceAnalysis.recommendation}</p>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>طباعة تفاصيل التقرير والتحليل</span>
                  </button>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                  <span className="text-4xl mb-2">👁️</span>
                  <p className="text-xs font-bold">حدد تقريراً من القائمة الجانبية لعرض التوصيات والتحاليل المفصلة للأداء</p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
