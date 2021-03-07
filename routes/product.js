const express = require('express')
const router = express.Router()
const { userById } = require('../controllers/user')
const { requireSignIn, isAdmin, isAuth } = require('../controllers/auth')

const {
  create,
  productById,
  read,
  remove,
  update,
  list,
  listRelated,
  listCategories,
  listBySearch,
  photo,
  listSearch,
} = require('../controllers/product')

router.get('/product/:productId', read)
router.delete(
  '/product/:productId/:userId',
  requireSignIn,
  isAdmin,
  isAuth,
  remove
)
router.put(
  '/product/:productId/:userId',
  requireSignIn,
  isAdmin,
  isAuth,
  update
)

router.get('/products', list)
router.get('/products/search', listSearch)
router.get('/products/categories', listCategories)
router.get('/products/related/:productId', listRelated)
router.get('/product/photo/:productId', photo)
router.post('/product/create/:userId', requireSignIn, isAdmin, isAuth, create)
router.post('/products/by/search', listBySearch)

router.param('userId', userById)
router.param('productId', productById)

module.exports = router
