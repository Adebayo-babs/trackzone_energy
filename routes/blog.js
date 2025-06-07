
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

let blogs = [];

router.get('/', (req, res) => res.render('blog/index', { blogs }));

router.get('/new', (req, res) => res.render('blog/new'));

router.post('/', upload.single('image'), (req, res) => {
    const { title, content } = req.body;
    blogs.push({
        title,
        content,
        image: req.file ? `/uploads/${req.file.filename}` : null,
        date: new Date()
    });
    res.redirect('/blog');
});

module.exports = router;
