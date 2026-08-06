import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Music,
  Volume2,
  VolumeX,
  Sparkles,
  Gift,
  MapPin,
  LogOut,
  Mail,
  Star,
  Camera,
  Compass,
  CheckCircle2,
  Coffee,
  Plane,
  Utensils,
  Crown,
  Clock,
  Plus,
  X,
  MessageCircle,
  Send,
  PenTool
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import useTypewriter from '../hooks/useTypewriter';
import useAudio from '../hooks/useAudio';

const iconMap = {
  Sparkles,
  Coffee,
  Heart,
  Plane,
  Utensils,
  Gift,
  Crown
};

function renderDynamicIcon(iconName, fallbackIcon = Heart, className = "w-5 h-5") {
  const IconComponent = iconMap[iconName] || fallbackIcon;
  return <IconComponent className={className} />;
}

function useTimeTogether(startDateStr) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(startDateStr || '2023-08-09T00:00:00');
      const now = new Date();
      const diffMs = Math.max(0, now - start);

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
      const seconds = Math.floor((diffMs / 1000) % 60);

      setTime({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [startDateStr]);

  return time;
}

export default function UserAnniversary() {
  const { role, config, updateConfig, logout } = useAuth();
  const navigate = useNavigate();

  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');

  const partnerName = config?.partnerName || 'Minh Châu';
  const creatorName = config?.creatorName || 'Chàng Trai Của Em';
  const anniversaryDate = config?.anniversaryDate || '2023-08-09';
  const invitation = config?.invitation || {};
  const loveLetter = config?.loveLetter?.long || config?.loveLetter?.short || '';
  const timeline = config?.timeline || [];
  const photos = config?.photos || [];
  const promises = config?.promises || [];
  const loveCoupons = config?.loveCoupons || [];
  const musicPlaylist = config?.music?.playlist?.length
    ? config.music.playlist
    : [{ id: 'm1', name: 'Từng Ngày Yêu Em', source: config?.music?.source || '/music.mp3' }];

  const { isPlaying, play, pause, currentTrackName, currentTrackIndex, totalTracks } = useAudio(
    musicPlaylist,
    config?.music?.volume || 0.6,
    true
  );
  const [selectedGiftId, setSelectedGiftId] = useState(() => config?.selectedGiftId || '');
  const [customGiftWish, setCustomGiftWish] = useState(() => config?.customGiftWish || '');
  const [isSavingWish, setIsSavingWish] = useState(false);

  useEffect(() => {
    if (config?.selectedGiftId !== undefined) {
      setSelectedGiftId(config.selectedGiftId || '');
    }
    if (config?.customGiftWish !== undefined) {
      setCustomGiftWish(config.customGiftWish || '');
    }
  }, [config]);

  const timeTogether = useTimeTogether(anniversaryDate);
  const typedLetter = useTypewriter(loveLetter, 30, envelopeOpen);
  const currentUserName = role === 'admin' ? creatorName : partnerName;

  const getUnreadCommentCount = (item) => {
    const comments = item.comments || [];
    return comments.filter((c) => !c.readBy || !c.readBy.includes(currentUserName)).length;
  };

  const handleOpenPhoto = async (photo, isTimeline = false) => {
    const existingComments = photo.comments || [];
    let needsUpdate = false;

    // Mark comments as read by current user
    const updatedComments = existingComments.map((c) => {
      const readByList = c.readBy || [];
      if (!readByList.includes(currentUserName)) {
        needsUpdate = true;
        return { ...c, readBy: [...readByList, currentUserName] };
      }
      return c;
    });

    const activePhotoObj = {
      ...photo,
      comments: updatedComments,
      isTimeline
    };
    setActivePhoto(activePhotoObj);

    if (needsUpdate) {
      if (isTimeline) {
        const updatedTimeline = timeline.map((t) => (t.id === photo.id ? { ...t, comments: updatedComments } : t));
        await updateConfig({ ...config, timeline: updatedTimeline });
      } else {
        const updatedPhotos = photos.map((p) => (p.id === photo.id ? { ...p, comments: updatedComments } : p));
        await updateConfig({ ...config, photos: updatedPhotos });
      }
    }
  };

  const handleSelectGift = async (id) => {
    setSelectedGiftId(id);
    await updateConfig({
      ...config,
      selectedGiftId: id,
      customGiftWish: id === 'c_custom' ? customGiftWish : ''
    });
  };

  const handleSaveCustomWish = async () => {
    setIsSavingWish(true);
    await updateConfig({
      ...config,
      selectedGiftId: 'c_custom',
      customGiftWish: customGiftWish
    });
    setIsSavingWish(false);
  };

  const handleUserPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const newPhoto = {
        id: 'p_' + Date.now(),
        src: reader.result,
        caption: `Khoảnh khắc mới của ${partnerName} & Anh`,
        location: 'Kỷ niệm yêu thương',
        comments: []
      };
      const updatedPhotos = [newPhoto, ...photos];
      await updateConfig({ ...config, photos: updatedPhotos });
      setIsUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activePhoto) return;

    const commentItem = {
      id: 'comment_' + Date.now(),
      author: currentUserName,
      text: newCommentText.trim(),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString(),
      readBy: [currentUserName] // Author has read their own comment
    };

    if (activePhoto.isTimeline) {
      const updatedTimeline = timeline.map((t) => {
        if (t.id === activePhoto.id) {
          const existingComments = t.comments || [];
          return { ...t, comments: [...existingComments, commentItem] };
        }
        return t;
      });

      const updatedActivePhoto = {
        ...activePhoto,
        comments: [...(activePhoto.comments || []), commentItem]
      };
      setActivePhoto(updatedActivePhoto);
      setNewCommentText('');
      await updateConfig({ ...config, timeline: updatedTimeline });
    } else {
      const updatedPhotos = photos.map((p) => {
        if (p.id === activePhoto.id) {
          const existingComments = p.comments || [];
          return { ...p, comments: [...existingComments, commentItem] };
        }
        return p;
      });

      const updatedActivePhoto = {
        ...activePhoto,
        comments: [...(activePhoto.comments || []), commentItem]
      };
      setActivePhoto(updatedActivePhoto);
      setNewCommentText('');
      await updateConfig({ ...config, photos: updatedPhotos });
    }
  };

  const handleLogout = () => {
    pause();
    logout();
    navigate('/');
  };

  const getSelectedGiftName = () => {
    if (!selectedGiftId) return null;
    if (selectedGiftId === 'c_custom') {
      return customGiftWish ? `Ý kiến riêng: "${customGiftWish}"` : 'Ý kiến riêng của em';
    }
    const found = loveCoupons.find((c) => c.id === selectedGiftId);
    return found ? found.title : null;
  };

  return (
    <div className="min-h-screen bg-aurora-soft text-slate-800 pb-20 font-body relative overflow-x-hidden">
      {/* Floating Animated UI Icons Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: 0.15,
              y: '105vh',
              x: `${(i * 7) % 100}vw`
            }}
            animate={{
              y: '-10vh',
              x: [`${(i * 7) % 100}vw`, `${((i * 7) % 100) + (i % 2 === 0 ? 5 : -5)}vw`]
            }}
            transition={{
              duration: 14 + (i % 5) * 3,
              repeat: Infinity,
              ease: 'linear',
              delay: (i * 0.6) % 5
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

      {/* Top Floating Navbar */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-pink-200/80 px-4 py-3 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden max-w-[55%] sm:max-w-none">
            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 shadow-sm shrink-0">
              <Heart className="w-4 h-4 fill-pink-500 heart-pop" />
            </div>
            <div className="overflow-hidden">
              <h1 className="font-display font-bold text-xs sm:text-base text-pink-600 leading-tight truncate">
                Anniversary Space • {partnerName}
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">Kỷ niệm 3 năm lãng mạn dành riêng cho em</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Audio Toggle */}
            <button
              onClick={isPlaying ? pause : play}
              className={`px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 text-xs font-semibold ${
                isPlaying
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-600 shadow-glow'
                  : 'bg-white/80 text-pink-600 border-pink-200 hover:bg-pink-50'
              }`}
              title="Bật/Tắt nhạc nền lãng mạn"
            >
              <Music className={`w-3.5 h-3.5 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
              <span className="hidden sm:inline">
                {isPlaying ? `${currentTrackName} (${currentTrackIndex}/${totalTracks})` : 'Phát nhạc'}
              </span>
              {isPlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-1.5 bg-white/80 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-pink-200 rounded-full transition-all text-xs font-medium"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 pt-6 space-y-12">
        {/* SECTION 1: HERO & INVITATION CARD */}
        <section className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white/80 backdrop-blur-xl border border-pink-200 rounded-3xl p-5 sm:p-10 shadow-glow relative overflow-hidden"
          >
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-pink-100/90 text-pink-700 font-semibold text-xs mb-4 border border-pink-200 whitespace-nowrap max-w-full overflow-hidden">
              <Sparkles className="w-3.5 h-3.5 text-pink-500 shrink-0" />
              <span className="truncate">KỶ NIỆM 3 NĂM YÊU NHAU • 2023 - 2026</span>
              <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 shrink-0" />
            </div>

            <h2 className="font-display text-2xl sm:text-4xl font-bold text-slate-900 mb-2 text-glow bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 bg-clip-text text-transparent leading-snug uppercase lining-nums break-normal hyphens-none">
              THIỆP MỜI HẸN HÒ
              <br />
              KỶ NIỆM 3 NĂM YÊU NHAU
            </h2>

            <p className="font-script text-xl sm:text-3xl text-pink-600 mb-6 italic leading-relaxed text-balance">
              Dành tặng người con gái anh yêu nhất: {partnerName}
            </p>

            {/* Days Together Counter - Fixed 4-Digit Box Overflow */}
            <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white p-5 sm:p-6 rounded-2xl shadow-lg my-6 text-center relative">
              <span className="text-xs uppercase tracking-widest font-bold opacity-90 block mb-3 flex items-center justify-center gap-1.5">
                <Clock className="w-4 h-4" />
                Tổng thời gian ta đã thuộc về nhau
              </span>
              <div className="grid grid-cols-4 gap-1.5 sm:gap-3 max-w-lg mx-auto">
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-2 sm:p-3 border border-white/30 text-center overflow-hidden">
                  <span className="font-body text-lg sm:text-2xl md:text-3xl font-extrabold block lining-nums tracking-tight leading-none mb-1.5 truncate">
                    {timeTogether.days}
                  </span>
                  <span className="text-[9px] sm:text-xs font-semibold opacity-90 block tracking-wider">NGÀY</span>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-2 sm:p-3 border border-white/30 text-center overflow-hidden">
                  <span className="font-body text-lg sm:text-2xl md:text-3xl font-extrabold block lining-nums tracking-tight leading-none mb-1.5 truncate">
                    {timeTogether.hours}
                  </span>
                  <span className="text-[9px] sm:text-xs font-semibold opacity-90 block tracking-wider">GIỜ</span>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-2 sm:p-3 border border-white/30 text-center overflow-hidden">
                  <span className="font-body text-lg sm:text-2xl md:text-3xl font-extrabold block lining-nums tracking-tight leading-none mb-1.5 truncate">
                    {timeTogether.minutes}
                  </span>
                  <span className="text-[9px] sm:text-xs font-semibold opacity-90 block tracking-wider">PHÚT</span>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-2 sm:p-3 border border-white/30 text-center overflow-hidden">
                  <span className="font-body text-lg sm:text-2xl md:text-3xl font-extrabold block lining-nums tracking-tight leading-none mb-1.5 truncate">
                    {timeTogether.seconds}
                  </span>
                  <span className="text-[9px] sm:text-xs font-semibold opacity-90 block tracking-wider">GIÂY</span>
                </div>
              </div>
              <p className="text-xs italic mt-4 opacity-95">
                "Mỗi giây phút trôi qua đều là khoảnh khắc ngọt ngào tuyệt vời nhất."
              </p>
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left my-6">
              <div className="p-4 bg-pink-50/80 rounded-2xl border border-pink-200 flex items-start gap-3">
                <MapPin className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-pink-600 uppercase">Điểm hẹn lãng mạn</h4>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{invitation.venue}</p>
                </div>
              </div>
              <div className="p-4 bg-pink-50/80 rounded-2xl border border-pink-200 flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-purple-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-pink-600 uppercase">Trang phục khuyến nghị</h4>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{invitation.dressCode}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/60 p-4 rounded-xl border border-pink-200/80 text-xs sm:text-sm text-slate-700 italic">
              "{invitation.invitationNote}"
            </div>
          </motion.div>
        </section>

        {/* SECTION 2: 3D INTERACTIVE LOVE ENVELOPE */}
        <section className="text-center">
          <div className="mb-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Mail className="w-6 h-6 text-pink-500 shrink-0" />
              <h3 className="font-display text-xl sm:text-3xl font-bold text-slate-900 leading-snug">
                Bức Thư Tình Gửi Em
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Nhấp vào phong bì bên dưới để mở lá thư tay ngọt ngào từ {creatorName}
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            {!envelopeOpen ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setEnvelopeOpen(true)}
                className="w-full bg-gradient-to-br from-pink-400 via-rose-400 to-purple-400 p-1 rounded-3xl shadow-glow text-left cursor-pointer group"
              >
                <div className="bg-white/90 rounded-[22px] p-8 sm:p-12 text-center border border-pink-200 relative overflow-hidden">
                  <div className="w-20 h-20 mx-auto rounded-full bg-pink-100 flex items-center justify-center text-pink-500 mb-4 group-hover:scale-110 transition-transform shadow-inner">
                    <Heart className="w-10 h-10 fill-pink-500 heart-pop" />
                  </div>
                  <h4 className="font-display text-xl sm:text-2xl font-bold text-slate-800 mb-1">
                    Gửi bé yêu thương của anh
                  </h4>
                  <p className="text-xs text-pink-600 font-medium flex items-center justify-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Chạm vào đây để mở niêm phong lá thư</span>
                  </p>
                </div>
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/90 backdrop-blur-xl border-2 border-pink-300 rounded-3xl p-6 sm:p-10 shadow-glow text-left relative"
              >
                <button
                  onClick={() => setEnvelopeOpen(false)}
                  className="absolute top-4 right-4 p-2 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-full transition-all text-xs font-semibold flex items-center gap-1"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Gập thư</span>
                </button>

                <div className="flex items-center gap-3 border-b border-pink-200 pb-4 mb-6">
                  <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
                  <div>
                    <h4 className="font-display font-bold text-lg text-slate-900">Bức Thư Tình 3 Năm Yêu Nhau</h4>
                    <p className="text-xs text-slate-500">Người gửi: {creatorName}</p>
                  </div>
                </div>

                <div className="font-body text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line border-l-4 border-pink-400 pl-4 bg-pink-50/50 p-4 rounded-r-2xl italic">
                  {typedLetter}
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* SECTION 3: LOVE STORY TIMELINE WITH CLICKABLE TIMELINE PHOTOS */}
        <section className="space-y-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Compass className="w-6 h-6 text-pink-500 shrink-0" />
              <h3 className="font-display text-xl sm:text-3xl font-bold text-slate-900 leading-snug">
                Hành Trình 3 Năm Yêu Nhau (Love Timeline)
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">Những cột mốc đáng nhớ nhất ghi dấu tình yêu đôi ta</p>
          </div>

          <div className="relative border-l-2 border-pink-300 ml-4 sm:ml-32 space-y-8 py-4">
            {timeline.map((item, idx) => {
              const commentCount = item.comments?.length || 0;
              return (
                <motion.div
                  key={item.id || idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="relative pl-6 sm:pl-8 group"
                >
                  {/* Timeline Dot Icon */}
                  <div className="absolute -left-[17px] top-1.5 w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-md group-hover:scale-125 transition-transform border-2 border-white">
                    {renderDynamicIcon(item.iconName, Heart, 'w-4 h-4 text-white')}
                  </div>

                  {/* Left Date label on larger screens */}
                  <div className="hidden sm:block absolute -left-36 top-2 text-right w-28 text-xs font-bold text-pink-600 bg-pink-100/80 px-2 py-1 rounded-md border border-pink-200">
                    {item.date}
                  </div>

                  {/* Card Content */}
                  <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-pink-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div>
                        <div className="sm:hidden text-xs font-bold text-pink-600 mb-1">{item.date}</div>
                        <h4 className="font-display text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                          {item.title}
                        </h4>
                      </div>

                      {/* Top Right Unread Comment Badge aligned with Title */}
                      {(() => {
                        const unreadCount = getUnreadCommentCount(item);
                        return (
                          <button
                            onClick={() => handleOpenPhoto({
                              id: item.id,
                              src: item.photoUrl,
                              caption: `${item.title} (${item.date})`,
                              location: item.description,
                              comments: item.comments || []
                            }, true)}
                            className={`p-1.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all shrink-0 ${
                              unreadCount > 0
                                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-glow hover:from-pink-600 hover:to-rose-600 animate-bounce'
                                : 'bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200'
                            }`}
                            title={unreadCount > 0 ? `${unreadCount} bình luận chưa đọc` : 'Xem / Thêm bình luận'}
                          >
                            <MessageCircle className="w-4 h-4" />
                            {unreadCount > 0 && <span>{unreadCount}</span>}
                          </button>
                        );
                      })()}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">{item.description}</p>
                    
                    {/* Clickable Timeline Photo */}
                    {item.photoUrl && (
                      <div
                        onClick={() => handleOpenPhoto({
                          id: item.id,
                          src: item.photoUrl,
                          caption: `${item.title} (${item.date})`,
                          location: item.description,
                          comments: item.comments || []
                        }, true)}
                        className="mt-3 relative rounded-xl overflow-hidden cursor-pointer group border border-pink-200 shadow-xs"
                      >
                        <img
                          src={item.photoUrl}
                          alt={item.title}
                          className="max-h-56 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* SECTION 4: PHOTO GALLERY */}
        <section className="space-y-6">
          <div className="text-center space-y-2 mb-6">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Camera className="w-6 h-6 text-pink-500 shrink-0" />
              <h3 className="font-display text-xl sm:text-3xl font-bold text-slate-900 leading-snug">
                Album Ảnh Kỷ Niệm 2 Đứa
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Những bức ảnh lưu giữ khoảnh khắc thanh xuân ngọt ngào của {partnerName} & Anh
            </p>
            <div className="pt-1">
              <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 active:scale-95 text-white rounded-full text-xs font-bold cursor-pointer shadow-md transition-all">
                <Plus className="w-4 h-4" />
                <span>{isUploadingPhoto ? 'Đang tải ảnh...' : 'Tải ảnh mới vào Album'}</span>
                <input type="file" accept="image/*" onChange={handleUserPhotoUpload} disabled={isUploadingPhoto} className="hidden" />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {photos.map((photo, idx) => {
              const unreadCount = getUnreadCommentCount(photo);
              return (
                <motion.div
                  key={photo.id || idx}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => handleOpenPhoto(photo, false)}
                  className="group relative bg-white rounded-2xl p-2 border border-pink-200 shadow-sm overflow-hidden cursor-pointer"
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-pink-50 relative">
                    <img
                      src={photo.src}
                      alt={photo.caption || 'Kỷ niệm'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {unreadCount > 0 && (
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 animate-pulse border border-white">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{unreadCount}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end text-white text-xs">
                      <span className="font-semibold line-clamp-1">{photo.caption}</span>
                      <span className="text-[10px] opacity-80">{photo.location}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* SECTION 5: SINGLE-CHOICE BIRTHDAY GIFT SELECTION (4 PRESETS + 1 CUSTOM) */}
        <section className="space-y-6">
          <div className="text-center space-y-1.5 mb-6">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Gift className="w-6 h-6 text-pink-500 shrink-0" />
              <h3 className="font-display text-xl sm:text-3xl font-bold text-slate-900 leading-snug">
                Quà Mong Muốn Sinh Nhật Sắp Tới Của Bé
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              {partnerName} hãy chọn 1 món quà duy nhất mà em thích nhất nhé! (Chọn ô khác sẽ tự động bỏ chọn ô cũ)
            </p>
          </div>

          {/* Active selection banner */}
          {getSelectedGiftName() && (
            <div className="p-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl shadow-md text-center text-xs sm:text-sm font-bold flex items-center justify-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-white" />
              <span>Bé đã chọn món quà: {getSelectedGiftName()} 💕</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 4 Preset Gift Boxes */}
            {loveCoupons.slice(0, 4).map((coupon) => {
              const isSelected = selectedGiftId === coupon.id;
              return (
                <div
                  key={coupon.id}
                  onClick={() => handleSelectGift(coupon.id)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden flex items-start gap-4 ${
                    isSelected
                      ? 'bg-gradient-to-br from-pink-50 to-rose-50 border-pink-500 shadow-glow ring-2 ring-pink-400/50'
                      : 'bg-white/90 border-pink-200 hover:border-pink-300 shadow-sm'
                  }`}
                >
                  <div className="p-3 bg-pink-100 rounded-2xl shrink-0 text-pink-600">
                    {renderDynamicIcon(coupon.iconName, Gift, 'w-6 h-6')}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-display font-bold text-base text-slate-900">{coupon.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{coupon.description}</p>
                    {isSelected && (
                      <p className="text-xs font-semibold text-pink-600 mt-2 italic flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{coupon.secretMessage || 'Đã chọn món quà này! 💕'}</span>
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 mt-1">
                    {isSelected ? (
                      <CheckCircle2 className="w-6 h-6 text-pink-500 fill-pink-100" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-pink-300" />
                    )}
                  </div>
                </div>
              );
            })}

            {/* 5th Box: Custom Wish Input for Girlfriend */}
            <div
              onClick={() => handleSelectGift('c_custom')}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden flex items-start gap-4 col-span-1 sm:col-span-2 ${
                selectedGiftId === 'c_custom'
                  ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-500 shadow-glow ring-2 ring-purple-400/50'
                  : 'bg-white/90 border-pink-200 hover:border-pink-300 shadow-sm'
              }`}
            >
              <div className="p-3 bg-purple-100 rounded-2xl shrink-0 text-purple-600">
                <PenTool className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-display font-bold text-base text-slate-900">Ý kiến khác dành riêng cho bé</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Nhập món quà hoặc mong muốn đặc biệt khác mà em thích nhất vào ô bên dưới nhé...
                </p>

                {selectedGiftId === 'c_custom' && (
                  <div className="mt-3 space-y-2" onClick={(e) => e.stopPropagation()}>
                    <textarea
                      rows={2}
                      value={customGiftWish}
                      onChange={(e) => setCustomGiftWish(e.target.value)}
                      placeholder="Ví dụ: Em muốn một album ảnh dán tay / Một món quà bất ngờ do anh tự chọn..."
                      className="w-full p-3 bg-white rounded-xl border border-purple-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-inner"
                    />
                    <button
                      onClick={handleSaveCustomWish}
                      disabled={isSavingWish}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-xs shadow-sm hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isSavingWish ? 'Đang lưu...' : 'Gửi mong muốn này cho Anh 💕'}</span>
                    </button>
                  </div>
                )}
              </div>
              <div className="shrink-0 mt-1">
                {selectedGiftId === 'c_custom' ? (
                  <CheckCircle2 className="w-6 h-6 text-purple-500 fill-purple-100" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-purple-300" />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: PROMISES & STARRY WISHES (WHITE CLEAN THEME) */}
        <section className="bg-white/80 backdrop-blur-xl border border-pink-200 rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-glow text-slate-800">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-400 shrink-0" />
              <h3 className="font-display text-xl sm:text-3xl font-bold text-slate-900 leading-snug">
                Bầu Trời Lời Hứa Chân Thành
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Những điều anh nguyện khắc ghi trong tim cho hành trình tương lai
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
            {promises.map((promise, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 bg-pink-50/70 backdrop-blur-md rounded-2xl border border-pink-200 flex items-start gap-3 hover:bg-pink-100/70 transition-all shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-pink-500 mt-0.5 shrink-0" />
                <p className="text-xs sm:text-sm text-slate-700 italic font-medium leading-relaxed">{promise}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center text-xs text-pink-600 italic font-semibold flex items-center justify-center gap-1.5">
            <span>Cảm ơn em đã là một phần tươi đẹp nhất trong thanh xuân của anh</span>
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500 heart-pop" />
          </div>
        </section>
      </main>

      {/* ENHANCED PROMINENT PHOTO LIGHTBOX MODAL WITH COMMENTS */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePhoto(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-lg flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-[32px] p-5 sm:p-8 max-w-5xl w-full max-h-[92vh] flex flex-col md:flex-row gap-6 overflow-hidden shadow-2xl border border-pink-200"
            >
              <button
                onClick={() => setActivePhoto(null)}
                className="absolute top-4 right-4 z-20 p-2.5 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-600 rounded-full transition-colors shadow-sm"
                title="Đóng modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left Side: Large Featured Photo Image & Details */}
              <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/95 p-3 sm:p-4 rounded-2xl overflow-hidden shadow-inner border border-slate-800">
                <img
                  src={activePhoto.src}
                  alt={activePhoto.caption}
                  className="rounded-xl max-h-[60vh] md:max-h-[75vh] w-full object-contain"
                />
                <div className="mt-3 text-center px-2 text-white">
                  <h4 className="font-display font-bold text-base sm:text-lg">{activePhoto.caption}</h4>
                  {activePhoto.location && (
                    <p className="text-xs text-pink-300 font-medium mt-1 flex items-center justify-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-pink-400" />
                      <span>{activePhoto.location}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Right Side: Photo Comments Panel */}
              <div className="w-full md:w-96 flex flex-col justify-between border-t md:border-t-0 md:border-l border-pink-200 pt-4 md:pt-0 md:pl-6 shrink-0">
                <div>
                  <h4 className="font-display font-bold text-base text-slate-900 flex items-center gap-2 mb-3 pb-3 border-b border-pink-100">
                    <MessageCircle className="w-5 h-5 text-pink-500" />
                    <span>Bình Luận Kỷ Niệm ({activePhoto.comments?.length || 0})</span>
                  </h4>

                  <div className="space-y-3 max-h-60 md:max-h-[58vh] overflow-y-auto pr-1">
                    {(!activePhoto.comments || activePhoto.comments.length === 0) ? (
                      <div className="text-center py-10 px-4 bg-pink-50/50 rounded-2xl border border-dashed border-pink-200">
                        <MessageCircle className="w-8 h-8 text-pink-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-500 font-medium">
                          Chưa có bình luận nào cho bức ảnh này.
                        </p>
                        <p className="text-[11px] text-pink-600 mt-1 italic">
                          Hãy viết lời chúc đầu tiên dành cho {partnerName} nhé! 💕
                        </p>
                      </div>
                    ) : (
                      activePhoto.comments.map((comment) => (
                        <div key={comment.id} className="p-3 bg-pink-50/80 rounded-2xl border border-pink-200/80 text-xs space-y-1 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                              comment.author === partnerName
                                ? 'bg-pink-100 text-pink-700 border border-pink-300'
                                : 'bg-purple-100 text-purple-700 border border-purple-300'
                            }`}>
                              {comment.author}
                            </span>
                            <span className="text-[10px] text-slate-400">{comment.createdAt}</span>
                          </div>
                          <p className="text-slate-800 leading-relaxed font-medium pt-1">{comment.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Add Comment Input Form */}
                <form onSubmit={handleAddComment} className="mt-4 pt-3 border-t border-pink-100 flex items-center gap-2">
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder={`Viết bình luận (${role === 'admin' ? creatorName : partnerName})...`}
                    className="flex-1 px-3.5 py-2.5 bg-pink-50/60 rounded-2xl border border-pink-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl transition-all shadow-md shrink-0 active:scale-95"
                    title="Gửi bình luận"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
