const User = require('../models/user')
const { errorHandler } = require('../helpers/dbErrorHandler')
const jwt = require('jsonwebtoken')
const expressJwt = require('express-jwt')

// Method: Post
// route: /api/signup

exports.signup = (req, res) => {
  const user = new User(req.body)

  User.findOne(user.email, (err, user) => {
    if (user) {
      return res.status(400).json(errorHandler(err))
    }
  })

  user.save((err, user) => {
    if (err) {
      return res.status(400).json({ error: errorHandler(err) })
    }

    user.salt = undefined
    user.hashed_password = undefined
    return res.status(201).json({ user })
  })
}

// Method: Post
// route: /api/signin

exports.signin = (req, res) => {
  //  find the user based on email
  const { email, password } = req.body

  User.findOne({ email }, (err, user) => {
    if (!user || err) {
      return res.status(400).json({ error: 'Email does not exist' })
    }

    //  >> if user found then make sure that email and password match
    if (!user.authenticate(password)) {
      return res
        .status(401)
        .json({ error: 'Email and password does not match' })
    }

    // generate a signed token with user id secret
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET)

    // persist the token as 't' with expiry date
    res.cookie('t', token, { data: new Date() + 9999 })

    // return response with user to frontend with token
    const { _id, email, name, role } = user
    res.json({ token, user: { _id, email, name, role } })
  })
}

// Method: Get
// route: /api/signout
exports.signout = (req, res) => {
  res.clearCookie('t')
  res.json({ message: 'Sign out success' })
}

// user auth middleware for checking weather user has signed in or not
exports.requireSignIn = expressJwt({
  secret: process.env.JWT_SECRET,
  userProperty: 'auth',
  algorithms: ['HS256'],
})

// middleware for making sure signed in user admin or not
exports.isAuth = (req, res, next) => {
  let user = req.profile._id == req.auth._id
  if (!user) {
    return res.status(403).json({
      error: 'Access Denied',
    })
  }
  next()
}

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    return res.status(403).json({ error: 'Admin route access denied' })
  }
  next()
}
