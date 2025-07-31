const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// This is the POST route the frontend form will call
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body; // email entered in form

  // Generate a reset link (this can be dynamic in future)
  const resetLink = `http://localhost:3000/reset-password?email=${email}`;

  // Setup Nodemailer transporter (using Gmail)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'faishalsaifi700@gmail.com', // replace with your Gmail
      pass: 'mluz drwo ocgg xqvi'     // replace with Gmail App Password
    }
  });

  const mailOptions = {
    from: 'faishalsaifi700@gmail.com',
    to: email, // send to user-entered email
    subject: 'Reset Your Password',
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Reset link sent to email' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ message: 'Failed to send email' });
  }
});

module.exports = router;
