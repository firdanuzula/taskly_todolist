const router = require("express").Router();
const { getTasks, createTask, updateTask, deleteTask } = require("../controllers/taskController");
const auth = require("../middleware/authMiddleware");

router.use(auth);

router.get("/", getTasks);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

module.exports = router;
