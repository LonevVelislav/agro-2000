const router = require("express").Router();
const globalController = require("./_controllers/globalController");
const machineController = require("./_controllers/machineController");
const userController = require("./_controllers/userController");

router.use(globalController);
router.use("/machines", machineController);
router.use("/users", userController);

module.exports = router;
