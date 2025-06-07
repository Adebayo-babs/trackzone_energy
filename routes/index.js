
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.render('pages/home'));
router.get('/about', (req, res) => res.render('pages/about'));
router.get('/services', (req, res) => res.render('pages/services'));
router.get('/careers', (req, res) => res.render('pages/careers'));
router.get('/contact', (req, res) => res.render('pages/contact'));
router.get('/profile1', (req, res) => res.render('pages/profile1'));
router.get('/blog', (req, res) => res.render('pages/blog'));
router.get('/blog1', (req, res) => res.render('pages/blog1more'));
router.get('/blog2', (req, res) => res.render('pages/blog2more'));
router.get('/blog3', (req, res) => res.render('pages/blog3more'));

module.exports = router;
