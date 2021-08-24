const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')

const Code = require('../models/Code')

router.get('/add', ensureAuth, (req, res) => {
  res.render('codes/add')
})

router.post('/', ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id
    await Code.create(req.body)
    res.redirect('/dashboard')
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

router.get('/', ensureAuth, async (req, res) => {
  try {
    const codes = await Code.find({ status: 'public' })
      .populate('user')
      .sort({ createdAt: 'desc' })
      .lean()

    res.render('codes/index', {
      codes,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

router.get('/:id', ensureAuth, async (req, res) => {
  try {
    let code = await Code.findById(req.params.id).populate('user').lean()

    if (!code) {
      return res.render('error/404')
    }

    if (code.user._id != req.user.id && code.status == 'private') {
      res.render('error/404')
    } else {
      res.render('codes/show', {
        code,
      })
    }
  } catch (err) {
    console.error(err)
    res.render('error/404')
  }
})

router.get('/edit/:id', ensureAuth, async (req, res) => {
  try {
    const code = await Code.findOne({
      _id: req.params.id,
    }).lean()

    if (!code) {
      return res.render('error/404')
    }

    if (code.user != req.user.id) {
      res.redirect('/codes')
    } else {
      res.render('codes/edit', {
        code,
      })
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

router.put('/:id', ensureAuth, async (req, res) => {
  try {
    let code = await Code.findById(req.params.id).lean()

    if (!code) {
      return res.render('error/404')
    }

    if (code.user != req.user.id) {
      res.redirect('/codes')
    } else {
      code = await Code.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      })

      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    let code = await Code.findById(req.params.id).lean()

    if (!code) {
      return res.render('error/404')
    }

    if (code.user != req.user.id) {
      res.redirect('/codes')
    } else {
      await Code.remove({ _id: req.params.id })
      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

router.get('/user/:userId', ensureAuth, async (req, res) => {
  try {
    const codes = await Code.find({
      user: req.params.userId,
      status: 'public',
    })
      .populate('user')
      .lean()

    res.render('codes/index', {
      codes,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})


module.exports = router