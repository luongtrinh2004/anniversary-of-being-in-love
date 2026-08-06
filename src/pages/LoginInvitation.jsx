import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Lock, Calendar, MapPin, Sparkles, KeyRound, ArrowRight, ShieldCheck, Crown, Gift, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function useCountdown(targetDateStr) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const target = targetDateStr ? new Date(targetDateStr).getTime() : new Date('2026-08-09T18:30:00').getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr]);

  return timeLeft;
}

export default function LoginInvitation() {
  const { login, role, config } = useAuth();
  const navigate = useNavigate();
  const [passcode, setPasscode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const invitation = config?.invitation || {
    title: 'THIỆP MỜI HẸN HÒ KỶ NIỆM 3 NĂM YÊU NHAU',
    eventDate: '2026-08-09T18:30:00',
    venue: 'Shang Chi Trung Hòa - Lẩu Đài Loan Băng Chuyền Siêu Tốc',
    dressCode: 'Hồng Pastel / Trắng Tinh Khôi / Đen Huyền Bí',
    invitationNote: 'Trân trọng kính mời Bé Yêu đến dự buổi hẹn hò đặc biệt mừng 3 năm ta thuộc về nhau! Nhớ đúng giờ và mang theo một trái tim đầy yêu thương nhé.'
  };

  const countdown = useCountdown(invitation.eventDate);

  useEffect(() => {
    if (role === 'admin') {
      navigate('/admin');
    } else if (role === 'user') {
      navigate('/user');
    }
  }, [role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passcode.length !== 4) {
      setErrorMessage('Vui lòng nhập đủ 4 chữ số mật mã tình yêu!');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const res = await login(passcode);
    setIsSubmitting(false);

    if (res.success) {
      if (res.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    } else {
      setErrorMessage(res.message || 'Mật mã chưa đúng rồi bé ơi!');
    }
  };

  const handleDigitClick = (num) => {
    if (passcode.length < 4) {
      setPasscode((prev) => prev + num);
    }
  };

  const handleClear = () => {
    setPasscode('');
    setErrorMessage('');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-aurora-soft text-slate-800 overflow-hidden font-body">
      {/* Floating Animated UI Icons Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {Array.from({ length: 14 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: 0.2 + (i % 3) * 0.15,
              y: '100vh',
              x: `${(i * 7) % 100}vw`,
              scale: 0.7 + (i % 3) * 0.3
            }}
            animate={{
              y: '-10vh',
              x: [`${(i * 7) % 100}vw`, `${((i * 7) % 100) + (i % 2 === 0 ? 6 : -6)}vw`]
            }}
            transition={{
              duration: 12 + (i % 4) * 3,
              repeat: Infinity,
              ease: 'linear',
              delay: (i * 0.7) % 4
            }}
            className="absolute text-pink-300/40 select-none"
          >
            {i % 3 === 0 ? (
              <Heart className="w-8 h-8 fill-pink-300/30 text-pink-400/40" />
            ) : i % 3 === 1 ? (
              <Sparkles className="w-7 h-7 text-pink-400/40" />
            ) : (
              <Gift className="w-7 h-7 text-purple-300/40" />
            )}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-xl bg-white/80 backdrop-blur-xl border border-pink-200/90 rounded-3xl shadow-glow p-5 sm:p-9 my-6 text-center"
      >
        {/* Top Badge strictly on 1 line */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-pink-100/90 to-rose-100/90 border border-pink-300/60 text-pink-700 text-xs font-semibold mb-3 shadow-xs whitespace-nowrap max-w-full overflow-hidden text-ellipsis">
          <Sparkles className="w-3.5 h-3.5 text-pink-500 shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="truncate">KỶ NIỆM 3 NĂM YÊU NHAU</span>
          <Heart className="w-3 h-3 text-pink-500 fill-pink-500 shrink-0 heart-pop" />
        </div>

        {/* Elegant Title with Intentional Line Breaks */}
        <h1 className="font-display text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2 text-glow bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 bg-clip-text text-transparent leading-snug uppercase lining-nums break-normal hyphens-none">
          THIỆP MỜI HẸN HÒ
          <br />
          KỶ NIỆM 3 NĂM YÊU NHAU
        </h1>

        {/* Poetic Subtitle with Balanced Line Break */}
        <p className="font-script text-xl sm:text-2xl text-pink-600 mb-5 italic leading-relaxed break-normal hyphens-none">
          "Hành trình 3 năm đong đầy
          <br />
          yêu thương & những nụ cười"
        </p>

        {/* Real-time Countdown Section */}
        <div className="my-5 p-4 sm:p-5 bg-pink-50/80 rounded-2xl border border-pink-200 shadow-inner">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-pink-600 mb-2.5 flex items-center justify-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-pink-500" />
            Đồng hồ đếm ngược đến ngày hẹn hò (09/08/2026)
          </p>
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            <div className="bg-white/90 p-2 sm:p-3 rounded-xl border border-pink-200 shadow-sm text-center">
              <span className="block font-body font-extrabold text-xl sm:text-3xl text-pink-600 lining-nums leading-none mb-1">
                {countdown.days}
              </span>
              <span className="text-[9px] sm:text-[11px] text-slate-500 font-semibold tracking-wider">NGÀY</span>
            </div>
            <div className="bg-white/90 p-2 sm:p-3 rounded-xl border border-pink-200 shadow-sm text-center">
              <span className="block font-body font-extrabold text-xl sm:text-3xl text-rose-600 lining-nums leading-none mb-1">
                {countdown.hours}
              </span>
              <span className="text-[9px] sm:text-[11px] text-slate-500 font-semibold tracking-wider">GIỜ</span>
            </div>
            <div className="bg-white/90 p-2 sm:p-3 rounded-xl border border-pink-200 shadow-sm text-center">
              <span className="block font-body font-extrabold text-xl sm:text-3xl text-pink-600 lining-nums leading-none mb-1">
                {countdown.minutes}
              </span>
              <span className="text-[9px] sm:text-[11px] text-slate-500 font-semibold tracking-wider">PHÚT</span>
            </div>
            <div className="bg-white/90 p-2 sm:p-3 rounded-xl border border-pink-200 shadow-sm text-center">
              <span className="block font-body font-extrabold text-xl sm:text-3xl text-purple-600 lining-nums leading-none mb-1">
                {countdown.seconds}
              </span>
              <span className="text-[9px] sm:text-[11px] text-slate-500 font-semibold tracking-wider">GIÂY</span>
            </div>
          </div>
        </div>

        {/* Invitation Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left my-5">
          <div className="p-3 bg-white/70 rounded-xl border border-pink-200/70 flex items-start gap-2.5 shadow-xs">
            <MapPin className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-[10px] font-bold text-pink-600 uppercase">Địa điểm hẹn hò</h4>
              <p className="text-xs sm:text-sm text-slate-800 font-semibold mt-0.5 leading-snug">{invitation.venue}</p>
            </div>
          </div>
          <div className="p-3 bg-white/70 rounded-xl border border-pink-200/70 flex items-start gap-2.5 shadow-xs">
            <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-[10px] font-bold text-pink-600 uppercase">Trang phục (Dress Code)</h4>
              <p className="text-xs sm:text-sm text-slate-800 font-semibold mt-0.5 leading-snug">{invitation.dressCode}</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600 italic bg-white/50 p-2.5 rounded-xl border border-pink-100 mb-5 leading-relaxed">
          "{invitation.invitationNote}"
        </p>

        {/* Passcode Login Form */}
        <form onSubmit={handleSubmit} className="mt-6 border-t border-pink-200/80 pt-5">
          <div className="flex items-center justify-center gap-2 mb-2">
            <KeyRound className="w-4 h-4 text-pink-500" />
            <h3 className="font-display text-base sm:text-lg font-bold text-slate-800">
              Nhập mật mã tình yêu (4 chữ số)
            </h3>
          </div>

          {/* Code Dots Preview */}
          <div className="flex justify-center gap-3 my-3">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-9 h-11 sm:w-11 sm:h-13 rounded-xl border-2 flex items-center justify-center transition-all shadow-sm ${
                  passcode[idx]
                    ? 'border-pink-500 bg-pink-50 text-pink-600 shadow-glow'
                    : 'border-pink-200 bg-white/80 text-slate-300'
                }`}
              >
                {passcode[idx] ? (
                  <Heart className="w-4 h-4 text-pink-500 fill-pink-500 animate-pulse" />
                ) : (
                  <span className="text-lg text-slate-300">•</span>
                )}
              </div>
            ))}
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2 mb-3 font-medium flex items-center justify-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* On-screen Keypad */}
          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto mb-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleDigitClick(num.toString())}
                className="py-2 bg-white/90 hover:bg-pink-100 active:scale-95 border border-pink-200 rounded-xl font-bold text-base text-slate-700 shadow-sm transition-all lining-nums"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl font-semibold text-xs transition-all"
            >
              Xóa
            </button>
            <button
              type="button"
              onClick={() => handleDigitClick('0')}
              className="py-2 bg-white/90 hover:bg-pink-100 active:scale-95 border border-pink-200 rounded-xl font-bold text-base text-slate-700 shadow-sm transition-all lining-nums"
            >
              0
            </button>
            <button
              type="submit"
              disabled={isSubmitting || passcode.length !== 4}
              className="py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1"
            >
              <span>Mở</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1">
            <Lock className="w-3.5 h-3.5 text-pink-400" />
            <span>Mật mã bí mật dành riêng cho 2 đứa mình</span>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
