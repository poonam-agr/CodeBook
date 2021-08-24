const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')

const Code = require('../models/Code')

router.get('/', ensureGuest, (req, res) => {
  res.render('login', {
    layout: 'login',
  })
})

router.get('/dashboard', ensureAuth, async (req, res) => {
  try {

    const codes = await Code.find({ user: req.user.id }).lean()
    res.render('dashboard', {
      name: req.user.firstName.charAt(0).toUpperCase()+req.user.firstName.slice(1),
      codes,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

module.exports = router