import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { ConfigModel } from './models/Config.js';
import { defaultAnniversaryConfig } from './defaultData.js';

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/anniversary_db';

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Connect to local MongoDB
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log(`[MongoDB] Connected successfully to ${MONGO_URI}`);
    let existing = await ConfigModel.findOne({ key: 'active_anniversary_config' });
    if (!existing) {
      console.log('[MongoDB] Initializing default romantic anniversary config...');
      await ConfigModel.create(defaultAnniversaryConfig);
      console.log('[MongoDB] Seeding completed!');
    } else {
      // Ensure partnerName is set to Minh Châu & update loveCoupons list if needed
      existing.partnerName = 'Minh Châu';
      if (!existing.loveCoupons || existing.loveCoupons.length !== 4) {
        existing.loveCoupons = defaultAnniversaryConfig.loveCoupons;
      }
      if (!existing.music?.source || existing.music.source.includes('actions.google.com')) {
        existing.music.source = defaultAnniversaryConfig.music.source;
      }
      await existing.save();
      console.log('[MongoDB] Updated partnerName to Minh Châu & loveCoupons preset items');
    }
  })
  .catch((err) => {
    console.error('[MongoDB] Connection error:', err);
  });

// Auth Login API
app.post('/api/auth/login', (req, res) => {
  const { code } = req.body;
  if (code === '1096') {
    return res.json({
      success: true,
      role: 'user',
      token: 'token-user-1096',
      message: 'Mật mã chính xác! Chào mừng Bé Yêu đến với không gian kỷ niệm 3 năm 💕'
    });
  } else if (code === '6969') {
    return res.json({
      success: true,
      role: 'admin',
      token: 'token-admin-6969',
      message: 'Xin chào Admin! Bạn đã đăng nhập quyền quản trị 👑'
    });
  } else {
    return res.status(401).json({
      success: false,
      message: 'Mật mã tình yêu chưa đúng rồi bé ơi! Thử lại nhé...'
    });
  }
});

// GET active config
app.get('/api/config', async (req, res) => {
  try {
    let config = await ConfigModel.findOne({ key: 'active_anniversary_config' });
    if (!config) {
      config = await ConfigModel.create(defaultAnniversaryConfig);
    }
    return res.json({ success: true, data: config });
  } catch (error) {
    console.error('Error fetching config:', error);
    return res.status(500).json({ success: false, message: 'Server error loading config' });
  }
});

// PUT update config (Admin & User)
app.put('/api/config', async (req, res) => {
  try {
    const updatedData = req.body;
    delete updatedData._id; // avoid mutating immutable _id
    
    const config = await ConfigModel.findOneAndUpdate(
      { key: 'active_anniversary_config' },
      { $set: updatedData },
      { new: true, upsert: true, strict: false, lean: true }
    );
    return res.json({ success: true, data: config, message: 'Đã lưu cài đặt thành công vào MongoDB!' });
  } catch (error) {
    console.error('Error updating config:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lưu cấu hình' });
  }
});

// POST reset config to default data
app.post('/api/config/reset', async (req, res) => {
  try {
    await ConfigModel.deleteOne({ key: 'active_anniversary_config' });
    const newConfig = await ConfigModel.create(defaultAnniversaryConfig);
    return res.json({ success: true, data: newConfig, message: 'Đã khôi phục dữ liệu mặc định!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Reset thất bại' });
  }
});

// Upload image API (base64 helper)
app.post('/api/upload', (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'Thiếu dữ liệu ảnh' });
    }
    return res.json({ success: true, url: imageBase64 });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Upload ảnh thất bại' });
  }
});

app.listen(PORT, () => {
  console.log(`[Server] Express API running on http://localhost:${PORT}`);
});
