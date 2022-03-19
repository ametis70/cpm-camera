const { Router } = require('express')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')

const { db, registerUser, getUser } = require('./db')

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  } else {
    return res.redirect('/login')
  }
}

function localStrategy() {
  return new LocalStrategy(function (username, password, done) {
    getUser((err, user) => {
      if (err) {
        return done(err)
      }
      if (user.username && user.username !== username) {
        return done(null, false)
      }
      if (!bcrypt.compareSync(password, user.password)) {
        return done(null, false)
      }

      return done(null, user)
    })
  })
}

function initPassport() {
  passport.serializeUser((user, done) => {
    done(null, user.username)
  })

  passport.deserializeUser((username, done) => {
    db.serialize(() => {
      getUser((err, user) => {
        if (err) return done(err)
        if (username !== user.username) return done(null, false)
        done(null, user)
      })
    })
  })

  passport.use('local', localStrategy())
}

const authRouter = Router()
authRouter.post(
  '/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function (_req, res) {
    res.redirect('/admin')
  },
)

authRouter.get('/login', (req, res) => {
  if (!req.isAuthenticated()) {
    res.render('login')
  } else {
    res.redirect('/admin')
  }
})

authRouter.post('/logout', function (req, res) {
  req.logout()
  res.redirect('/')
})

authRouter.get('/check', ensureAuthenticated, function (req, res) {
  res.json({ authenticated: true })
})

module.exports = {
  initPassport,
  ensureAuthenticated,
  authRouter,
}
