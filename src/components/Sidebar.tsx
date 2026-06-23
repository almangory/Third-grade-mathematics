import { UserProfile } from '../types';
import { BookOpen, FileText, Gamepad2, Award, Heart, Sparkles, LogOut, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, FormEvent } from 'react';

interface SidebarProps {
  user: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onUnlockWatermark: (password: string) => boolean;
  isWatermarkRemoved: boolean;
  onResetPoints?: () => void;
}

export default function Sidebar({
  user,
  activeTab,
  setActiveTab,
  onUnlockWatermark,
  isWatermarkRemoved,
  onResetPoints
}: SidebarProps) {
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const menuItems = [
    { id: 'curriculum', label: 'المنهج الدراسي', icon: BookOpen, color: 'bg-blue-500 hover:bg-blue-600', textCol: 'text-blue-600', bgCol: 'bg-blue-50' },
    { id: 'worksheets', label: 'أوراق العمل', icon: FileText, color: 'bg-green-500 hover:bg-green-600', textCol: 'text-green-600', bgCol: 'bg-green-50' },
    { id: 'games', label: 'مركز الألعاب التفاعلي', icon: Gamepad2, color: 'bg-purple-500 hover:bg-purple-600', textCol: 'text-purple-600', bgCol: 'bg-purple-50' },
    { id: 'progress', label: 'الأوسمة والتقارير', icon: Award, color: 'bg-orange-500 hover:bg-orange-600', textCol: 'text-orange-600', bgCol: 'bg-orange-50' },
    { id: 'favorites', label: 'الدروس المفضلة', icon: Heart, color: 'bg-red-500 hover:bg-red-600', textCol: 'text-red-600', bgCol: 'bg-red-50' },
  ];

  const handleUnlockSubmit = (e: FormEvent) => {
    e.preventDefault();
    const success = onUnlockWatermark(password);
    if (success) {
      setShowUnlockModal(false);
      setPassword('');
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <aside className="w-72 bg-white border-l-4 border-[#FCD34D] flex flex-col shadow-xl select-none" dir="rtl" id="app-sidebar">
      {/* User Status Section */}
      <div className="p-6 flex flex-col items-center border-b-2 border-yellow-50 relative overflow-hidden">
        <div className="absolute top-2 right-2">
          <button
            onClick={() => setShowUnlockModal(true)}
            title="إعدادات العلامة المائية الخاصة"
            className={`p-1.5 rounded-full transition-all ${
              isWatermarkRemoved ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 hover:bg-yellow-100 hover:text-yellow-600'
            }`}
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="w-24 h-24 bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg mb-3 cursor-pointer"
        >
          <span className="text-5xl">{user.avatar}</span>
        </motion.div>

        <h2 className="text-xl font-bold text-gray-800 font-sans">{user.name}</h2>
        <p className="text-xs text-gray-400 font-bold mt-1">البطل الصغير • 8 سنوات</p>

        <div className="flex items-center gap-1.5 mt-3 bg-yellow-100 border border-yellow-200 px-4 py-1.5 rounded-full shadow-sm">
          <span className="text-yellow-600 text-base">⭐</span>
          <span className="text-yellow-700 text-sm font-black font-mono">{user.points} نقطة</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 p-4 rounded-2xl transition-all text-right font-bold text-base cursor-pointer shadow-sm ${
                isActive
                  ? `${item.color} text-white shadow-md transform translate-x-1`
                  : 'bg-white text-gray-700 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20' : item.bgCol}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : item.textCol}`} />
              </div>
              <span className="flex-1 font-sans">{item.label}</span>
              {isActive && (
                <motion.span layoutId="activeIndicator" className="text-white text-xs">
                  ◀
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Badges Preview at the Bottom */}
      <div className="p-5 border-t border-gray-100 bg-gray-50/50">
        <div className="bg-amber-50/80 border border-amber-100 rounded-2xl p-3.5 shadow-inner">
          <p className="text-xs text-amber-600 mb-2 font-black tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> أوسمتي الذهبية ({user.badges.length})
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            {user.badges.length === 0 ? (
              <p className="text-xs text-gray-400 font-sans py-1">أكمل أول وحدة لتحصل على وسامك الأول! 🏅</p>
            ) : (
              user.badges.map((badge) => (
                <motion.div
                  key={badge.id}
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  className="w-10 h-10 bg-white border border-yellow-200 rounded-xl shadow-sm flex items-center justify-center text-xl cursor-help"
                  title={`${badge.title}: ${badge.description}`}
                >
                  {badge.icon}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Lock Watermark Modal (Hidden & Protected Password Area) */}
      {showUnlockModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 max-w-sm w-full border-4 border-yellow-300 shadow-2xl"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-800">إعدادات العلامة المائية للمناهج</h3>
              <button onClick={() => setShowUnlockModal(false)} className="text-gray-400 hover:text-gray-600 font-sans text-xl">✕</button>
            </div>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              تتم إضافة علامة مائية تلقائياً لكل أوراق العمل باسم <strong className="text-amber-600">"نقلة للمناهج الإلكترونية"</strong> لتوثيق الجودة وحفظ الحقوق.
              <br />
              لإزالتها، يجب إدخال الرمز السري الخاص بالمعلم/الإدارة:
            </p>
            <form onSubmit={handleUnlockSubmit} className="space-y-3">
              <input
                type="password"
                placeholder="أدخل الرمز السري الخاص"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                className={`w-full p-3 bg-gray-50 border-2 rounded-xl text-center font-mono focus:outline-none focus:border-amber-400 ${
                  error ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {error && (
                <p className="text-xs text-red-500 font-bold text-center">الرمز السري غير صحيح! حاول مرة أخرى.</p>
              )}
              {isWatermarkRemoved && (
                <p className="text-xs text-green-600 font-bold text-center">تم تفعيل وضع إزالة العلامة المائية بنجاح! ✅</p>
              )}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  تحقق وتأكيد
                </button>
                <button
                  type="button"
                  onClick={() => setShowUnlockModal(false)}
                  className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </aside>
  );
}
