const db = require('../models/db');

// ✅ Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email FROM users');
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// ✅ Get single user by ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT id, name, email FROM users WHERE id = ?', [id]);
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
};

// ✅ Update user (name or email)
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  try {
    await db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};

// ✅ Delete user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
};
