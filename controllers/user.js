const User = require('../models/user')
const { Order } = require('../models/order')
const { errorHandler } = require('../helpers/dbErrorHandler')

// setting up user in request

exports.userById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (!user || err) {
      return res.status(400).json({ error: 'user not found' })
    }

    req.profile = user

    next()
  })
}

// Method: Get
// route: /user/:userId

exports.read = (req, res) => {
  req.profile.hashed_password = undefined
  req.profile.salt = undefined

  return res.json(req.profile)
}

// Method: Put
// route: /user/:userId
exports.update = (req, res) => {
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $set: req.body },
    { new: true },
    (err, user) => {
      if (err) {
        return res
          .status(400)
          .json({ error: 'you are not authorize to perform the action' })
      }
      user.hashed_password = undefined
      user.salt = undefined

      res.json(user)
    }
  )
}

exports.addOrderToHistory = (req, res, next) => {
  let history = []

  req.body.order.products.forEach((product) => {
    history.push({
      _id: product._id,
      name: product.name,
      description: product.description,
      category: product.category,
      qty: product.count,
      transaction_id: req.body.order.transaction_id,
      amount: req.body.order.amount,
    })
  })

  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $push: { history: history } },
    { new: true },
    (error, data) => {
      if (error) {
        return res.status(400).json({ error: 'Could not update user history' })
      }

      next()
    }
  )
}

exports.purchaseHistory = (req, res) => {
  Order.find({ user: req.profile._id })
    .populate('user')
    .sort('-createdAt')
    .exec((error, orders) => {
      if (error) {
        res.status(400).json(errorHandler(error))
      }

      res.json(orders)
    })
}
