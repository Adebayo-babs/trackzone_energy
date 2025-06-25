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

        // Configure email transporter with proper SMTP settings
        const transporter = nodemailer.createTransport({
            // Gmail SMTP Configuration (Fixed)
            host: 'smtp.gmail.com',
            port: 587, // Use 587 for STARTTLS
            secure: false, // Use STARTTLS
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS // Use App Password, not regular password
            },
            tls: {
                rejectUnauthorized: false // Allow self-signed certificates
            }
        });

        // Alternative SMTP configurations you can use:

        // Option 1: Outlook/Hotmail SMTP
        /*
        const transporter = nodemailer.createTransporter({
            host: 'smtp-mail.outlook.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                ciphers: 'SSLv3'
            }
        });
        */

        // Option 2: Yahoo SMTP
        /*
        const transporter = nodemailer.createTransporter({
            host: 'smtp.mail.yahoo.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        */

        // Option 3: Generic SMTP (like cPanel, Hostinger, etc.)
        /*
        const transporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST, // e.g., 'mail.yourdomain.com'
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        */

        // Option 4: SendGrid SMTP
        /*
        const transporter = nodemailer.createTransporter({
            host: 'smtp.sendgrid.net',
            port: 587,
            secure: false,
            auth: {
                user: 'apikey',
                pass: process.env.SENDGRID_API_KEY
            }
        });
        */

        // Test the connection
        await transporter.verify();
        console.log('SMTP connection successful');

        // Email content
        const mailOptions = {
            from: `"${name}" <${process.env.EMAIL_USER}>`, // Use your SMTP email as sender
            to: process.env.RECIPIENT_EMAIL,
            replyTo: email, // Set reply-to as the form submitter's email
            subject: `Contact Form Submission from ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1a237e;">New Contact Form Submission</h2>
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Company:</strong> ${company || 'Not provided'}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Message:</strong></p>
                        <div style="background-color: white; padding: 15px; border-radius: 4px; margin-top: 10px;">
                            ${message.replace(/\n/g, '<br>')}
                        </div>
                    </div>
                    <p style="color: #666; font-size: 12px; margin-top: 20px;">
                        This message was sent from your website contact form.
                    </p>
                </div>
            `
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);

        // Return success response
        res.status(200).json({ 
            success: true, 
            message: 'Message sent successfully' 
        });

    } catch (error) {
        console.error('Error sending email:', error);
        
        // More detailed error handling
        let errorMessage = 'Server error, could not send message';
        
        if (error.code === 'EAUTH') {
            errorMessage = 'Authentication failed. Please check your email credentials.';
        } else if (error.code === 'ESOCKET') {
            errorMessage = 'Connection failed. Please check your SMTP settings.';
        } else if (error.code === 'EENVELOPE') {
            errorMessage = 'Invalid email address format.';
        }

        res.status(500).json({ 
            success: false, 
            message: errorMessage
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// To run the app: npm run start