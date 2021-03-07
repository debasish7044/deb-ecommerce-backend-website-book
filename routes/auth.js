const express = require('express')
const router = express.Router()
const {
  signup,
  signin,
  signout,
  requireSignIn,
} = require('../controllers/auth')
const { userSignUpValidator } = require('../validator/index')

router.post('/signup', userSignUpValidator, signup)
router.post('/signin', signin)
router.get('/signout', signout)

// router.get('/hello', requireSignIn, (req, res) => {
//   res.send('hello from the other side')
// })

module.exports = router
