const pool = require("../config/db");

// GET /api/tasks
exports.getTasks = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error." });
  }
};

// POST /api/tasks
exports.createTask = async (req, res) => {
  const { title, description = "" } = req.body;
  if (!title?.trim()) return res.status(400).json({ message: "Title is required." });

  try {
    const [result] = await pool.query(
      "INSERT INTO tasks (user_id, title, description, status) VALUES (?, ?, ?, 'pending')",
      [req.user.id, title.trim(), description.trim()]
    );
    const [rows] = await pool.query("SELECT * FROM tasks WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error." });
  }
};

// PUT /api/tasks/:id  — edit title, description, status
exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;

  if (!title?.trim()) return res.status(400).json({ message: "Title is required." });

  const validStatuses = ["pending", "completed"];
  if (status && !validStatuses.includes(status))
    return res.status(400).json({ message: "Invalid status." });

  try {
    const [rows] = await pool.query(
      "SELECT * FROM tasks WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: "Task not found." });

    const current = rows[0];
    const newTitle = title?.trim() ?? current.title;
    const newDesc  = description !== undefined ? description.trim() : current.description;
    const newStatus = status ?? current.status;

    await pool.query(
      "UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ? AND user_id = ?",
      [newTitle, newDesc, newStatus, id, req.user.id]
    );

    const [updated] = await pool.query("SELECT * FROM tasks WHERE id = ?", [id]);
    res.json(updated[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error." });
  }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT id FROM tasks WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: "Task not found." });

    await pool.query("DELETE FROM tasks WHERE id = ?", [id]);
    res.json({ message: "Task deleted." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error." });
  }
};
