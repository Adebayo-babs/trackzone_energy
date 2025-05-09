require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const multer = require('multer');


const app = express();

// Set up view engine
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for parsing request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const indexRoutes = require('./routes/index');
const blogRoutes = require('./routes/blog');

app.use('/', indexRoutes);
app.use('/blog', blogRoutes);

// Contact form submission endpoint
app.post('/api/contact', async (req, res) => {
    try {
      const { name, company, email, message } = req.body;
      
      // Validate required fields
      if (!name || !email || !message) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please fill all required fields' 
        });
      }
      
      // Configure email transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      
      // Email content
      const mailOptions = {
        from: email,
        to: process.env.RECIPIENT_EMAIL, 
        subject: `Contact Form Submission from ${name}`,
        html: `
          <h2>Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Company:</strong> ${company || 'Not provided'}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `
      };
      
      // Send email
      await transporter.sendMail(mailOptions);
      
      // Return success response
      res.status(200).json({ 
        success: true, 
        message: 'Message sent successfully' 
      });
      
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error, could not send message' 
      });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));