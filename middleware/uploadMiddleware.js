const multer = require('multer');
const path = require('path');

// إعداد Multer لتخزين الصور
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // المجلد اللي هتتحفظ فيه الصور
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // اسم الملف الفريد
  },
});

const upload = multer({ storage: storage });

module.exports = upload;