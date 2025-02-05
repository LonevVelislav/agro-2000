const router = require("express").Router();
const path = require("path");
const fs = require("fs-extra");
const sharp = require("sharp");
const libre = require("libreoffice-convert");

const Machine = require("../_models/Machine");
const mongoose = require("mongoose");

const upload = require("../utils/uploadImage");
const uploadFile = require("../utils/uploadFile");
const QueryFiltering = require("../utils/QueryFiltering");
const { extractErrorMsg } = require("../utils/extractErrorMsg");
const { protect, restrict, restrictToOnwer } = require("../middlewares/authMiddleware");

//server directory
const serverDir = path.resolve("../server/src/uploads/");
//file utils
const converToPdf = async (inputBuffer, outputPath) => {
    return new Promise((resolve, reject) => {
        libre.convert(inputBuffer, ".pdf", undefined, (err, result) => {
            if (err) {
                return reject(err);
            }
            fs.writeFileSync(outputPath, result);
            resolve(outputPath);
        });
    });
};

function keepOriginalName(name) {
    return Buffer.from(name, "latin1").toString("utf8");
}

//routes
//get all machines
router.get("/", async (req, res) => {
    try {
        const filtered = new QueryFiltering(Machine.find(), req.query)
            .filter()
            .sort()
            .filterFields()
            .paginate();

        const machines = await filtered.query;

        res.status(200).json({
            status: "success",
            results: machines.length,
            data: {
                machines,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: extractErrorMsg(err),
        });
    }
});

//get machine by _id
router.get("/:id", async (req, res) => {
    try {
        const machine = await Machine.findById(req.params.id);
        res.status(200).json({
            status: "success",
            data: {
                machine,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: extractErrorMsg(err),
        });
    }
});

//post new machine
router.post("/", protect, restrict("user", "admin"), upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error("upload photo of the machine !");
        }
        const newMachine = await Machine.create({
            ...req.body,
            priceEU: req.body.price * 0.51,
            owner: req.user._id,
            email: req.user.email,
        });

        const dir = `${serverDir}/${newMachine._id}/photos`;
        const filename = req.file.originalname;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        await sharp(req.file.buffer)
            .toFormat("jpeg")
            .resize(1024, 768)
            .toFile(`${dir}/${filename}`);

        newMachine.images.push(filename);
        await newMachine.save();

        res.status(200).json({
            status: "success",
            data: {
                machine: newMachine,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: extractErrorMsg(err),
        });
    }
});

//patch a machine
router.patch("/:id", protect, restrict("user", "admin"), restrictToOnwer, async (req, res) => {
    try {
        const editedMachine = await Machine.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body,
                priceEU: req.body.currency === "BGN" ? req.body.price * 0.51 : req.body.price * 1,
            },
            { new: true, runValidators: true }
        );

        res.status(201).json({
            status: "success",
            data: {
                machine: editedMachine,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: extractErrorMsg(err),
        });
    }
});

//image logic//
router.patch(
    "/image/:id",
    protect,
    restrict("user", "admin"),
    restrictToOnwer,
    upload.single("image"),
    async (req, res) => {
        try {
            if (req.file) {
                const editedMachine = await Machine.findById(req.params.id);
                await sharp(req.file.buffer)
                    .toFormat("jpeg")
                    .resize(1024, 768)
                    .toFile(`${serverDir}/${editedMachine._id}/photos/${req.file.originalname}`);

                if (editedMachine.images.length > 12) {
                    throw new Error("cant add more images !");
                }
                if (editedMachine.images.includes(req.file.originalname)) {
                    throw new Error("there is image with the same name !");
                }

                editedMachine.images.push(req.file.originalname);
                await editedMachine.save();

                res.status(201).json({
                    status: "success",
                    data: {
                        machine: editedMachine,
                    },
                });
            }
        } catch (err) {
            res.status(400).json({
                status: "fail",
                message: extractErrorMsg(err),
            });
        }
    }
);

router.patch(
    "/image/delete/:id",
    protect,
    restrict("user", "admin"),
    restrictToOnwer,
    async (req, res) => {
        try {
            const index = req.body.index;
            const machine = await Machine.findById(req.params.id);
            const dir = `${serverDir}/${machine._id}/photos`;

            if (machine.images.length <= 1) {
                throw new Error("machine needs 1 image !");
            } else {
                if (fs.existsSync(`${dir}/${machine.images[index]}`)) {
                    fs.unlinkSync(`${dir}/${machine.images[index]}`);
                }

                machine.images.splice(index, 1);
                await machine.save();
            }

            res.status(200).json({
                status: "success",
                data: {
                    machine,
                },
            });
        } catch (err) {
            res.status(400).json({
                status: "fail",
                message: extractErrorMsg(err),
            });
        }
    }
);

//file logic//
router.patch(
    "/file/:id",
    protect,
    restrict("user", "admin"),
    restrictToOnwer,
    uploadFile.single("file"),
    async (req, res) => {
        try {
            if (req.file) {
                const editedMachine = await Machine.findById(req.params.id);

                const dir = `${serverDir}/${editedMachine._id}/files`;
                const originalName = keepOriginalName(req.file.originalname);

                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                fs.writeFileSync(`${dir}/${originalName}`, req.file.buffer);
                let fileName;
                if (originalName.split(".")[1] !== "pdf") {
                    fileName = `${originalName.split(".")[0]}.pdf`;
                    const pdfPath = `${dir}/${fileName}`;

                    await converToPdf(req.file.buffer, pdfPath);
                    fs.unlinkSync(`${dir}/${originalName}`);
                } else {
                    fileName = originalName;
                }

                if (editedMachine.files.includes(fileName)) {
                    throw new Error("file with same name already exist!");
                }

                editedMachine.files.push(fileName);
                await editedMachine.save();

                res.status(201).json({
                    status: "success",
                    data: {
                        machine: editedMachine,
                    },
                });
            }
        } catch (err) {
            res.status(400).json({
                status: "fail",
                message: extractErrorMsg(err),
            });
        }
    }
);

router.patch(
    "/file/delete/:id",
    protect,
    restrict("user", "admin"),
    restrictToOnwer,
    async (req, res) => {
        try {
            const index = req.body.index;
            const machine = await Machine.findById(req.params.id);
            const dir = `${serverDir}/${machine._id}/files`;

            if (fs.existsSync(`${dir}/${machine.files[index]}`)) {
                fs.unlinkSync(`${dir}/${machine.files[index]}`);
            }
            machine.files.splice(index, 1);
            await machine.save();

            res.status(200).json({
                status: "success",
                data: {
                    machine,
                },
            });
        } catch (err) {
            res.status(400).json({
                status: "fail",
                message: extractErrorMsg(err),
            });
        }
    }
);

//video logic
router.patch(
    "/video/:id",
    protect,
    restrict("user", "admin"),
    restrictToOnwer,

    async (req, res) => {
        if (req.body.video) {
            try {
                const editedMachine = await Machine.findById(req.params.id);
                if (editedMachine.videos.length >= 3) {
                    throw new Error("cant add more videos !");
                }
                if (editedMachine.videos.includes(req.body)) {
                    throw new Error("there is video with the same name !");
                }

                const url = req.body.video.trim();
                const videoId = extractYouTubeVideoId(url);

                const iframe = `https://www.youtube.com/embed/${videoId}`;

                function extractYouTubeVideoId(url) {
                    const regex =
                        /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
                    const match = url.match(regex);
                    return match ? match[1] : null;
                }

                editedMachine.videos.push(iframe);
                await editedMachine.save();
                res.status(201).json({
                    status: "success",
                    data: {
                        machine: editedMachine,
                    },
                });
            } catch (err) {
                res.status(400).json({
                    status: "fail",
                    message: extractErrorMsg(err),
                });
            }
        }
    }
);

router.patch(
    "/video/delete/:id",
    protect,
    restrict("user", "admin"),
    restrictToOnwer,
    async (req, res) => {
        try {
            const index = req.body.index;
            const machine = await Machine.findById(req.params.id);

            machine.videos.splice(index, 1);
            await machine.save();

            res.status(200).json({
                status: "success",
                data: {
                    machine,
                },
            });
        } catch (err) {
            res.status(400).json({
                status: "fail",
                message: extractErrorMsg(err),
            });
        }
    }
);

//delete machine
router.delete("/:id", protect, restrict("user", "admin"), restrictToOnwer, async (req, res) => {
    try {
        const uploadsPath = path.resolve("../server/src/uploads/");
        await Machine.findByIdAndDelete(req.params.id);

        //delete machine folder data
        fs.rmSync(`${uploadsPath}/${req.params.id}`, { recursive: true, force: true });

        res.status(204).json({
            status: "success",
            data: null,
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: extractErrorMsg(err),
        });
    }
});

module.exports = router;
