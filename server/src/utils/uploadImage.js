const multer = require("multer");

const multerStorage = multer.memoryStorage({});

const upload = multer({
    storage: multerStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed!"), false);
        }
    },
});

module.exports = upload;
