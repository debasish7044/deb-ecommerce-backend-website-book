const express = require('express')
const router = express.Router()
const { userById } = require('../controllers/user')
const { requireSignIn, isAdmin, isAuth } = require('../controllers/auth')
const {
  create,
  update,
  remove,
  list,
  read,
  categoryById,
} = require('../controllers/category')

router.get('/category/:categoryId', read)
router.post('/category/create/:userId', requireSignIn, isAdmin, isAuth, create)
router.put(
  '/category/:categoryId/:userId',
  requireSignIn,
  isAdmin,
  isAuth,
  update
)
router.delete(
  '/category/:categoryId/:userId',
  requireSignIn,
  isAdmin,
  isAuth,
  remove
)
router.get('/categories', list)

router.param('categoryId', categoryById)
router.param('userId', userById)

module.exports = router
