const multer = require('multer');
const path = require('path');

// Store uploaded Excel/CSV files in memory buffer for quick parsing without residual temporary disk files
const storage = multer.memoryStorage();

// File filter to ensure only spreadsheet files (.xlsx, .xls, .csv) are uploaded
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.xlsx', '.xls', '.csv'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Please upload an Excel (.xlsx, .xls) or CSV file.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB maximum file size limit
  }
});

module.exports = upload;
