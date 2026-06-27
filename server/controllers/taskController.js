const pool = require("../config/db");

const VALID_STATUSES   = ["pending", "completed"];
const VALID_PRIORITIES = ["low", "medium", "high"];
const VALID_SORTS      = ["created_at", "due_date", "priority", "title", "status"];
const PRIORITY_ORDER   = { high: 0, medium: 1, low: 2 };

// ─── GET /api/tasks ────────────────────────────────────────────────────────
// Query params: ?status=pending|completed|all  &sort=created_at|due_date|priority|title|status  &order=asc|desc  &search=keyword
exports.getTasks = async (req, res) => {
  try {
    const { status, sort = "created_at", order = "desc", search = "" } = req.query;

    // Build WHERE
    let where = "WHERE user_id = ?";
    const params = [req.user.id];

    if (status && VALID_STATUSES.includes(status)) {
      where += " AND status = ?";
      params.push(status);
    }

    if (search.trim()) {
      where += " AND (title LIKE ? OR description LIKE ?)";
      const keyword = `%${search.trim()}%`;
      params.push(keyword, keyword);
    }

    // Safe sort column
    const sortCol = VALID_SORTS.includes(sort) ? sort : "created_at";
    const sortDir = order === "asc" ? "ASC" : "DESC";

    // priority sort: high > medium > low  →  use FIELD()
    let orderClause;
    if (sortCol === "priority") {
      orderClause = `ORDER BY FIELD(priority, 'high', 'medium', 'low') ${sortDir}`;
    } else if (sortCol === "due_date") {
      // NULLs last regardless of direction
      orderClause = `ORDER BY due_date IS NULL ASC, due_date ${sortDir}`;
    } else {
      orderClause = `ORDER BY ${sortCol} ${sortDir}`;
    }

    const [rows] = await pool.query(
      `SELECT * FROM tasks ${where} ${orderClause}`,
      params
    );

    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── POST /api/tasks ───────────────────────────────────────────────────────
exports.createTask = async (req, res) => {
  const { title, description = "", due_date = null, priority = "medium" } = req.body;

  if (!title?.trim())
    return res.status(400).json({ message: "Title is required." });

  if (priority && !VALID_PRIORITIES.includes(priority))
    return res.status(400).json({ message: "Invalid priority." });

  try {
    const [result] = await pool.query(
      "INSERT INTO tasks (user_id, title, description, status, due_date, priority) VALUES (?, ?, ?, 'pending', ?, ?)",
      [req.user.id, title.trim(), description.trim(), due_date || null, priority]
    );
    const [rows] = await pool.query("SELECT * FROM tasks WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── PUT /api/tasks/:id ────────────────────────────────────────────────────
exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status, due_date, priority } = req.body;

  if (!title?.trim())
    return res.status(400).json({ message: "Title is required." });

  if (status && !VALID_STATUSES.includes(status))
    return res.status(400).json({ message: "Invalid status." });

  if (priority && !VALID_PRIORITIES.includes(priority))
    return res.status(400).json({ message: "Invalid priority." });

  try {
    const [rows] = await pool.query(
      "SELECT * FROM tasks WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: "Task not found." });

    const cur = rows[0];
    const newTitle    = title?.trim()       ?? cur.title;
    const newDesc     = description !== undefined ? description.trim() : cur.description;
    const newStatus   = status              ?? cur.status;
    const newDueDate  = due_date !== undefined ? (due_date || null) : cur.due_date;
    const newPriority = priority            ?? cur.priority;

    await pool.query(
      "UPDATE tasks SET title = ?, description = ?, status = ?, due_date = ?, priority = ? WHERE id = ? AND user_id = ?",
      [newTitle, newDesc, newStatus, newDueDate, newPriority, id, req.user.id]
    );

    const [updated] = await pool.query("SELECT * FROM tasks WHERE id = ?", [id]);
    res.json(updated[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── PATCH /api/tasks/:id/toggle ──────────────────────────────────────────
// Quick toggle tanpa kirim semua field
exports.toggleTask = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM tasks WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: "Task not found." });

    const newStatus = rows[0].status === "completed" ? "pending" : "completed";
    await pool.query(
      "UPDATE tasks SET status = ? WHERE id = ? AND user_id = ?",
      [newStatus, id, req.user.id]
    );

    const [updated] = await pool.query("SELECT * FROM tasks WHERE id = ?", [id]);
    res.json(updated[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── DELETE /api/tasks/:id ─────────────────────────────────────────────────
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
