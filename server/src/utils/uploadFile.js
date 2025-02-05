const multer = require("multer");

const multerStorage = multer.memoryStorage({});

const uploadFile = multer({
    storage: multerStorage,
    fileFilter: (req, file, cb) => {
        const allowed = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/plain",
        ];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("only coduments are allowed !"), false);
        }
    },
    limits: { fileSize: 1024 * 1024 * 10 },
});

module.exports = uploadFile;
