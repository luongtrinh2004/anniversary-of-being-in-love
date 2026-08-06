import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { compressImage } from '../utils/imageCompressor';
import {
  Save,
  LogOut,
  Eye,
  Plus,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  Heart,
  Calendar,
  MapPin,
  FileText,
  Gift,
  Check,
  Clock,
  Music,
  ArrowLeft,
  Crown,
  Coffee,
  Plane,
  Utensils,
  Star,
  ShoppingBag,
  HeartHandshake
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ICON_OPTIONS = [
  'Sparkles',
  'Coffee',
  'Heart',
  'Plane',
  'Utensils',
  'Gift',
  'Crown',
  'Star',
  'ShoppingBag',
  'HeartHandshake'
];

export default function AdminDashboard() {
  const { config, updateConfig, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('invitation');
  const [formData, setFormData] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (config && !formData) {
      setFormData(JSON.parse(JSON.stringify(config)));
    }
  }, [config, formData]);

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-aurora-soft text-pink-600 font-bold">
        Đang tải dữ liệu quản trị từ MongoDB...
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMsg({ type: '', text: '' });
    const res = await updateConfig(formData);
    setIsSaving(false);

    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Đã lưu tất cả thay đổi vào MongoDB local thành công!' });
    } else {
      setStatusMsg({ type: 'error', text: res.message || 'Lỗi khi lưu dữ liệu!' });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handlePhotoUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressedDataUrl = await compressImage(file);
      const newPhotos = [...formData.photos];
      if (index !== undefined) {
        newPhotos[index].src = compressedDataUrl;
      } else {
        newPhotos.push({
          id: 'p_' + Date.now(),
          src: compressedDataUrl,
          caption: 'Ảnh mới thêm',
          location: 'Kỷ niệm'
        });
      }
      setFormData({ ...formData, photos: newPhotos });
    } catch (err) {
      console.error('Image compression failed', err);
      alert('Không thể tải ảnh. Vui lòng chọn file hình ảnh JPG/PNG hợp lệ.');
    }
  };

  const handleTimelinePhotoUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressedDataUrl = await compressImage(file);
      const updated = [...(formData.timeline || [])];
      updated[index].photoUrl = compressedDataUrl;
      setFormData({ ...formData, timeline: updated });
    } catch (err) {
      console.error('Image compression failed', err);
      alert('Không thể tải ảnh mốc kỷ niệm. Vui lòng thử lại.');
    }
  };

  const handleAddTimeline = () => {
    const newTimeline = [
      ...(formData.timeline || []),
      {
        id: 't_' + Date.now(),
        title: 'Cột mốc mới',
        date: new Date().toISOString().split('T')[0],
        iconName: 'Sparkles',
        description: 'Mô tả câu chuyện ngọt ngào...',
        photoUrl: '',
        comments: []
      }
    ];
    setFormData({ ...formData, timeline: newTimeline });
  };

  const handleRemoveTimeline = (index) => {
    const newTimeline = (formData.timeline || []).filter((_, i) => i !== index);
    setFormData({ ...formData, timeline: newTimeline });
  };

  const handleMusicFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('File MP3 quá lớn (vượt quá 15MB). Vui lòng chọn file nhạc nhỏ hơn 15MB!');
      return;
    }

    const currentPlaylist = formData.music?.playlist?.length
      ? formData.music.playlist
      : [{ id: 'm1', name: 'Từng Ngày Yêu Em', source: formData.music?.source || '/music.mp3' }];

    if (currentPlaylist.length >= 3) {
      alert('Đã đạt tối đa 3 bài hát trong danh sách phát!');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const newTrack = {
        id: 'm_' + Date.now(),
        name: file.name.replace(/\.[^/.]+$/, ''),
        source: reader.result
      };
      const updatedPlaylist = [...currentPlaylist, newTrack];
      setFormData({
        ...formData,
        music: { ...formData.music, playlist: updatedPlaylist }
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveMusicTrack = (index) => {
    const currentPlaylist = formData.music?.playlist?.length
      ? formData.music.playlist
      : [{ id: 'm1', name: 'Từng Ngày Yêu Em', source: formData.music?.source || '/music.mp3' }];

    if (currentPlaylist.length <= 1) {
      alert('Phải giữ lại ít nhất 1 bài hát trong danh sách phát!');
      return;
    }
    const updated = currentPlaylist.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      music: { ...formData.music, playlist: updated }
    });
  };

  const handleAddCoupon = () => {
    const newCoupons = [
      ...(formData.loveCoupons || []),
      {
        id: 'c_' + Date.now(),
        title: 'Vé Quà Tặng Mới',
        description: 'Mô tả đặc quyền cho bạn gái...',
        iconName: 'Gift',
        isRevealed: false,
        secretMessage: 'Mã bí mật & phần thưởng!'
      }
    ];
    setFormData({ ...formData, loveCoupons: newCoupons });
  };

  const handleRemoveCoupon = (index) => {
    const newCoupons = formData.loveCoupons.filter((_, i) => i !== index);
    setFormData({ ...formData, loveCoupons: newCoupons });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-body pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-slate-800/90 backdrop-blur-md border-b border-slate-700 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-pink-400" />
            <div>
              <h1 className="font-display font-bold text-lg text-pink-400">Admin Management • Kỷ Niệm 3 Năm</h1>
              <p className="text-[11px] text-slate-400">Quản trị nội dung & lưu trữ trực tiếp vào MongoDB Local</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/user')}
              className="px-3 py-1.5 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Eye className="w-4 h-4" />
              <span>Xem trang Người Yêu</span>
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-1.5 bg-slate-700 hover:bg-rose-900/50 text-slate-300 hover:text-rose-300 rounded-xl transition-all"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {statusMsg.text && (
          <div
            className={`p-4 rounded-2xl border text-sm font-medium flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
            }`}
          >
            <Sparkles className="w-5 h-5 shrink-0" />
            <span>{statusMsg.text}</span>
          </div>
        )}

        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
          {[
            { id: 'invitation', label: 'Thiệp Hẹn Hò & Đếm Ngược', icon: Calendar },
            { id: 'letter', label: 'Thư Tình', icon: FileText },
            { id: 'timeline', label: 'Love Story Timeline', icon: Clock },
            { id: 'photos', label: 'Album Ảnh', icon: ImageIcon },
            { id: 'coupons', label: 'Thẻ Quà & Lời Hứa', icon: Gift }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-pink-500 text-white shadow-glow'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1 */}
        {activeTab === 'invitation' && (
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-pink-400 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-pink-400" />
              <span>Chỉnh sửa Thiệp Mời Hẹn Hò Kỷ Niệm 3 Năm</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Tiêu đề thiệp mời</label>
                <input
                  type="text"
                  value={formData.invitation?.title || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      invitation: { ...formData.invitation, title: e.target.value }
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Ngày đếm ngược hẹn hò (ISO YYYY-MM-DDTHH:mm:ss)
                </label>
                <input
                  type="text"
                  value={formData.invitation?.eventDate || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      invitation: { ...formData.invitation, eventDate: e.target.value }
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Địa điểm hẹn hò</label>
                <input
                  type="text"
                  value={formData.invitation?.venue || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      invitation: { ...formData.invitation, venue: e.target.value }
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Trang phục (Dress code)</label>
                <input
                  type="text"
                  value={formData.invitation?.dressCode || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      invitation: { ...formData.invitation, dressCode: e.target.value }
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Tên Bạn Gái (Partner Name)</label>
                <input
                  type="text"
                  value={formData.partnerName || ''}
                  onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Tên Bạn (Creator Name)</label>
                <input
                  type="text"
                  value={formData.creatorName || ''}
                  onChange={(e) => setFormData({ ...formData, creatorName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 p-5 bg-slate-900/80 border border-slate-700/80 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-pink-400 flex items-center gap-2">
                      <Music className="w-4 h-4 text-pink-400" />
                      <span>Danh sách Nhạc Nền Phát Lần Lượt (Tối đa 3 bài MP3)</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Hệ thống tự động phát lần lượt 1 ➔ 2 ➔ 3 và lặp lại xoay vòng (1 ➔ 2 ➔ 3 ➔ 1...)
                    </p>
                  </div>

                  {((formData.music?.playlist?.length || (formData.music?.source ? 1 : 0)) < 3) && (
                    <label className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-md shrink-0">
                      <Plus className="w-4 h-4" />
                      <span>Tải file MP3 từ máy (Tối đa 3 bài)</span>
                      <input
                        type="file"
                        accept="audio/mp3,audio/*"
                        onChange={handleMusicFileUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Playlist Tracks list */}
                <div className="space-y-3">
                  {(formData.music?.playlist?.length
                    ? formData.music.playlist
                    : [{ id: 'm1', name: 'Từng Ngày Yêu Em', source: formData.music?.source || '/music.mp3' }]
                  ).map((track, idx) => (
                    <div key={track.id || idx} className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl flex items-center gap-3 relative">
                      <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-pink-300 font-bold text-xs shrink-0">
                        #{idx + 1}
                      </div>

                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-400">Tên bài hát #{idx + 1}</label>
                          <input
                            type="text"
                            value={track.name || ''}
                            onChange={(e) => {
                              const current = formData.music?.playlist?.length
                                ? [...formData.music.playlist]
                                : [{ id: 'm1', name: 'Từng Ngày Yêu Em', source: formData.music?.source || '/music.mp3' }];
                              current[idx].name = e.target.value;
                              setFormData({
                                ...formData,
                                music: { ...formData.music, playlist: current }
                              });
                            }}
                            placeholder={`Tên bài hát ${idx + 1}...`}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400">Đường dẫn file MP3 / DataURL</label>
                          <input
                            type="text"
                            value={track.source || ''}
                            onChange={(e) => {
                              const current = formData.music?.playlist?.length
                                ? [...formData.music.playlist]
                                : [{ id: 'm1', name: 'Từng Ngày Yêu Em', source: formData.music?.source || '/music.mp3' }];
                              current[idx].source = e.target.value;
                              setFormData({
                                ...formData,
                                music: { ...formData.music, playlist: current }
                              });
                            }}
                            placeholder="/music.mp3 hoặc dán URL..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveMusicTrack(idx)}
                        className="p-2 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white rounded-lg transition-all shrink-0"
                        title="Xóa bài hát này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Ngày bắt đầu yêu</label>
                <input
                  type="date"
                  value={formData.anniversaryDate || ''}
                  onChange={(e) => setFormData({ ...formData, anniversaryDate: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 mb-1">Lời nhắn thiệp</label>
                <textarea
                  rows={3}
                  value={formData.invitation?.invitationNote || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      invitation: { ...formData.invitation, invitationNote: e.target.value }
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:border-pink-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2 */}
        {activeTab === 'letter' && (
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-pink-400 flex items-center gap-2">
              <FileText className="w-5 h-5 text-pink-400" />
              <span>Chỉnh sửa Bức Thư Tình Gửi Người Yêu</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Thư tình dài (Hiển thị trong phong bì 3D)</label>
              <textarea
                rows={10}
                value={formData.loveLetter?.long || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    loveLetter: { ...formData.loveLetter, long: e.target.value }
                  })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm text-slate-100 focus:border-pink-500 focus:outline-none leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* TAB 3 */}
        {activeTab === 'timeline' && (
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-pink-400 flex items-center gap-2">
                <Clock className="w-5 h-5 text-pink-400" />
                <span>Quản lý Các Mốc Thời Gian (Love Timeline)</span>
              </h3>
              <button
                onClick={handleAddTimeline}
                className="px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm mốc kỷ niệm</span>
              </button>
            </div>

            <div className="space-y-4">
              {formData.timeline.map((item, index) => (
                <div key={item.id || index} className="p-4 bg-slate-900 border border-slate-700 rounded-2xl space-y-3 relative">
                  <button
                    onClick={() => handleRemoveTimeline(index)}
                    className="absolute top-4 right-4 p-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white rounded-lg transition-all"
                    title="Xóa mốc này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-10">
                    <div>
                      <label className="block text-[11px] text-slate-400">Tiêu đề mốc</label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const updated = [...formData.timeline];
                          updated[index].title = e.target.value;
                          setFormData({ ...formData, timeline: updated });
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400">Ngày diễn ra</label>
                      <input
                        type="text"
                        value={item.date}
                        onChange={(e) => {
                          const updated = [...formData.timeline];
                          updated[index].date = e.target.value;
                          setFormData({ ...formData, timeline: updated });
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400">Biểu tượng Lucide Icon</label>
                      <select
                        value={item.iconName || 'Heart'}
                        onChange={(e) => {
                          const updated = [...formData.timeline];
                          updated[index].iconName = e.target.value;
                          setFormData({ ...formData, timeline: updated });
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                      >
                        {ICON_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400">Mô tả câu chuyện</label>
                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={(e) => {
                        const updated = [...formData.timeline];
                        updated[index].description = e.target.value;
                        setFormData({ ...formData, timeline: updated });
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Ảnh đính kèm mốc kỷ niệm</label>
                    <div className="flex items-center gap-3">
                      {item.photoUrl ? (
                        <img
                          src={item.photoUrl}
                          alt=""
                          className="w-16 h-16 object-cover rounded-xl border border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl border border-dashed border-slate-700 bg-slate-800/60 flex items-center justify-center text-slate-500 text-[10px] text-center p-1 shrink-0">
                          Chưa có ảnh
                        </div>
                      )}

                      <div className="flex-1 space-y-1.5">
                        <input
                          type="text"
                          value={item.photoUrl || ''}
                          onChange={(e) => {
                            const updated = [...formData.timeline];
                            updated[index].photoUrl = e.target.value;
                            setFormData({ ...formData, timeline: updated });
                          }}
                          placeholder="Dán link ảnh URL hoặc tải ảnh từ máy bên dưới ->"
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                        />

                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 rounded-xl text-xs font-semibold cursor-pointer transition-all">
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tải ảnh từ máy cho mốc này</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleTimelinePhotoUpload(e, index)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4 */}
        {activeTab === 'photos' && (
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-pink-400 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-pink-400" />
                <span>Quản lý Album Ảnh Kỷ Niệm</span>
              </h3>
              <label className="px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all">
                <Plus className="w-4 h-4" />
                <span>Tải ảnh mới từ máy</span>
                <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e)} className="hidden" />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formData.photos.map((photo, index) => (
                <div key={photo.id || index} className="p-4 bg-slate-900 border border-slate-700 rounded-2xl flex gap-3 relative">
                  <button
                    onClick={() => {
                      const updated = formData.photos.filter((_, i) => i !== index);
                      setFormData({ ...formData, photos: updated });
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <img src={photo.src} alt="" className="w-24 h-24 object-cover rounded-xl border border-slate-700 shrink-0" />

                  <div className="flex-1 space-y-2 pr-6">
                    <div>
                      <label className="block text-[10px] text-slate-400">Chú thích ảnh</label>
                      <input
                        type="text"
                        value={photo.caption}
                        onChange={(e) => {
                          const updated = [...formData.photos];
                          updated[index].caption = e.target.value;
                          setFormData({ ...formData, photos: updated });
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400">Địa điểm</label>
                      <input
                        type="text"
                        value={photo.location || ''}
                        onChange={(e) => {
                          const updated = [...formData.photos];
                          updated[index].location = e.target.value;
                          setFormData({ ...formData, photos: updated });
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5 */}
        {activeTab === 'coupons' && (
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 space-y-8">
            {/* Girlfriend Birthday Gift Choice Status Card */}
            <div className="p-5 bg-gradient-to-r from-pink-950/80 via-purple-950/80 to-slate-900/90 border-2 border-pink-500/60 rounded-2xl shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-pink-300 font-bold text-sm">
                  <Sparkles className="w-5 h-5 text-pink-400 animate-pulse" />
                  <span>Món quà sinh nhật Minh Châu đã chọn từ giao diện:</span>
                </div>
                <span className="text-[10px] px-2.5 py-1 bg-pink-500/20 text-pink-300 rounded-full border border-pink-400/40 font-semibold">
                  Đồng bộ MongoDB Local
                </span>
              </div>

              {formData.selectedGiftId === 'c_custom' ? (
                <div className="p-3.5 bg-slate-900/90 rounded-xl border border-purple-400/50 text-xs space-y-1">
                  <span className="font-bold text-purple-300 block uppercase tracking-wider text-[10px]">✨ Ý kiến khác dành riêng cho bé:</span>
                  <p className="text-pink-200 font-bold text-sm italic">
                    "{formData.customGiftWish || 'Châu chưa nhập nội dung cụ thể...'}"
                  </p>
                </div>
              ) : formData.selectedGiftId ? (
                <div className="p-3.5 bg-slate-900/90 rounded-xl border border-pink-400/50 text-xs space-y-1">
                  <span className="font-bold text-pink-300 block uppercase tracking-wider text-[10px]">🎁 Thẻ quà tặng được chọn:</span>
                  <p className="text-pink-100 font-bold text-sm">
                    {formData.loveCoupons?.find((c) => c.id === formData.selectedGiftId)?.title || formData.selectedGiftId}
                  </p>
                  <p className="text-slate-300 text-xs">
                    {formData.loveCoupons?.find((c) => c.id === formData.selectedGiftId)?.description}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic bg-slate-900/50 p-3 rounded-xl border border-slate-700">
                  Bé Minh Châu chưa bấm chọn món quà nào trên giao diện người dùng.
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-pink-400 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-pink-400" />
                  <span>Quản lý Thẻ Quà Tặng Tình Yêu (Love Coupons)</span>
                </h3>
                <button
                  onClick={handleAddCoupon}
                  className="px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm thẻ quà tặng</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(formData.loveCoupons || []).map((coupon, index) => (
                  <div key={coupon.id || index} className="p-4 bg-slate-900 border border-slate-700 rounded-2xl space-y-2 relative">
                    <button
                      onClick={() => handleRemoveCoupon(index)}
                      className="absolute top-2 right-2 p-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-4 gap-2 pr-8">
                      <div className="col-span-1">
                        <label className="block text-[10px] text-slate-400">Lucide Icon</label>
                        <select
                          value={coupon.iconName || 'Gift'}
                          onChange={(e) => {
                            const updated = [...formData.loveCoupons];
                            updated[index].iconName = e.target.value;
                            setFormData({ ...formData, loveCoupons: updated });
                          }}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                        >
                          {ICON_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-3">
                        <label className="block text-[10px] text-slate-400">Tên thẻ quà tặng</label>
                        <input
                          type="text"
                          value={coupon.title}
                          onChange={(e) => {
                            const updated = [...formData.loveCoupons];
                            updated[index].title = e.target.value;
                            setFormData({ ...formData, loveCoupons: updated });
                          }}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400">Mô tả quà tặng</label>
                      <input
                        type="text"
                        value={coupon.description}
                        onChange={(e) => {
                          const updated = [...formData.loveCoupons];
                          updated[index].description = e.target.value;
                          setFormData({ ...formData, loveCoupons: updated });
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400">Thông điệp cào mở bí mật</label>
                      <input
                        type="text"
                        value={coupon.secretMessage || ''}
                        onChange={(e) => {
                          const updated = [...formData.loveCoupons];
                          updated[index].secretMessage = e.target.value;
                          setFormData({ ...formData, loveCoupons: updated });
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-700 pt-6 space-y-4">
              <h3 className="text-lg font-bold text-pink-400 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-400" />
                <span>Danh sách Lời Hứa Chân Thành</span>
              </h3>

              {formData.promises.map((promise, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={promise}
                    onChange={(e) => {
                      const updated = [...formData.promises];
                      updated[index] = e.target.value;
                      setFormData({ ...formData, promises: updated });
                    }}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                  <button
                    onClick={() => {
                      const updated = formData.promises.filter((_, i) => i !== index);
                      setFormData({ ...formData, promises: updated });
                    }}
                    className="p-2 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button
                onClick={() => setFormData({ ...formData, promises: [...formData.promises, 'Lời hứa mới...'] })}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-pink-400 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm lời hứa</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
