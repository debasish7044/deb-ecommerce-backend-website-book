const express = require('express')
const router = express.Router()
const { userById, addOrderToHistory } = require('../controllers/user')
const { requireSignIn, isAdmin, isAuth } = require('../controllers/auth')
const {
  create,
  listOrders,
  getStatusValues,
  orderById,
  updateOrderStatus,
} = require('../controllers/order')
const { decreaseQuantity } = require('../controllers/product')

router.post(
  '/order/create/:userId',
  requireSignIn,
  isAuth,
  addOrderToHistory,
  decreaseQuantity,
  create
)

router.get('/order/list/:userId', requireSignIn, isAuth, isAdmin, listOrders)
router.get(
  '/order/status-values/:userId',
  requireSignIn,
  isAuth,
  isAdmin,
  getStatusValues
)
router.put(
  '/order/:orderId/status/:userId',
  requireSignIn,
  isAuth,
  isAdmin,
  updateOrderStatus
)

router.param('userId', userById)
router.param('orderId', orderById)

module.exports = router
