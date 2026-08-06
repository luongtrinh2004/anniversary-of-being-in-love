import mongoose from 'mongoose';

const timelineItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    date: { type: String, required: true },
    iconName: { type: String, default: 'Heart' },
    emoji: { type: String, default: '' },
    description: { type: String, default: '' },
    photoUrl: { type: String, default: '' },
    comments: { type: Array, default: [] }
  },
  { _id: false }
);

const photoItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    src: { type: String, required: true },
    caption: { type: String, default: '' },
    location: { type: String, default: '' },
    comments: { type: Array, default: [] }
  },
  { _id: false }
);

const loveCouponSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    iconName: { type: String, default: 'Gift' },
    icon: { type: String, default: '' },
    secretMessage: { type: String, default: '' }
  },
  { _id: false }
);

const musicTrackSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, default: 'Bài hát lãng mạn' },
    source: { type: String, required: true }
  },
  { _id: false }
);

const configSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'active_anniversary_config', unique: true },
    invitation: {
      title: { type: String, default: 'THIỆP MỜI HẸN HÒ KỶ NIỆM 3 NĂM YÊU NHAU' },
      eventDate: { type: String, default: '2026-08-09T18:30:00' },
      venue: { type: String, default: 'Shang Chi Trung Hòa - Lẩu Đài Loan Băng Chuyền Siêu Tốc' },
      dressCode: { type: String, default: 'Hồng Pastel / Trắng Tinh Khôi / Đen Huyền Bí' },
      invitationNote: { type: String, default: 'Trân trọng kính mời Bé Yêu đến dự buổi hẹn hò đặc biệt mừng 3 năm ta thuộc về nhau! Nhớ đúng giờ và mang theo một trái tim đầy yêu thương nhé.' }
    },
    anniversaryDate: { type: String, default: '2023-08-09' },
    creatorName: { type: String, default: 'Anh (Chàng Trai Của Em)' },
    partnerName: { type: String, default: 'Minh Châu' },
    selectedGiftId: { type: String, default: '' },
    customGiftWish: { type: String, default: '' },
    loveLetter: {
      short: { type: String, default: 'Cảm ơn em đã biến 1096 ngày vừa qua thành cuốn phim ngọt ngào nhất cuộc đời anh.' },
      long: { type: String, default: 'Bé yêu của anh,\n\nTròn 3 năm kể từ cái gật đầu đầu tiên, từng khoảnh khắc bên em đều là một giấc mơ rực rỡ.\n\nTrang web này là món quà nhỏ anh tự tay chuẩn bị, để lưu giữ từng mảnh ký ức rực rỡ của chúng ta.\n\nMãi yêu em!' }
    },
    timeline: [timelineItemSchema],
    photos: [photoItemSchema],
    promises: [{ type: String }],
    loveCoupons: [loveCouponSchema],
    music: {
      source: { type: String, default: '/music.mp3' },
      volume: { type: Number, default: 0.6 },
      playlist: [musicTrackSchema]
    }
  },
  { timestamps: true, strict: false }
);

export const ConfigModel = mongoose.model('Config', configSchema);
