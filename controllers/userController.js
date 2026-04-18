const db = require('../models/db');

// ✅ Get all users

exports.getAllUsers = async (req, res) => {
  try {
    // Fetch only required fields
    const [users] = await db.query(
      'SELECT user_id, name, email FROM user'
    );

    res.json(users);

  } catch (err) {
    console.error('❌ Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// ✅ Get single user by ID

exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const [results] = await db.query(
      'SELECT user_id, name, email FROM user WHERE user_id = ?',
      [id]
    );

    // ❗ If no user found
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(results[0]);

  } catch (err) {
    console.error('❌ Error fetching user:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// ✅ Update user

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  // 🔍 Basic validation
  if (!name || !email) {
    return res.status(400).json({
      message: "Name and email are required"
    });
  }

  try {
    // 🔍 Check if user exists
    const [check] = await db.query(
      'SELECT * FROM user WHERE user_id = ?',
      [id]
    );

    if (check.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // 🔒 Prevent duplicate email
    const [existing] = await db.query(
      'SELECT * FROM user WHERE email = ? AND user_id != ?',
      [email, id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "Email already in use"
      });
    }

    // ✅ Update user
    await db.query(
      'UPDATE user SET name = ?, email = ? WHERE user_id = ?',
      [name, email, id]
    );

    res.json({ message: 'User updated successfully' });

  } catch (err) {
    console.error('❌ Update error:', err);
    res.status(500).json({ error: 'Update failed' });
  }
};

// ✅ Delete user

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // 🔍 Check if user exists
    const [check] = await db.query(
      'SELECT * FROM user WHERE user_id = ?',
      [id]
    );

    if (check.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // ⚠️ Delete user
    await db.query(
      'DELETE FROM user WHERE user_id = ?',
      [id]
    );

    res.json({ message: 'User deleted successfully' });

  } catch (err) {
    console.error('❌ Delete error:', err);
    res.status(500).json({ error: 'Delete failed' });
  }
};