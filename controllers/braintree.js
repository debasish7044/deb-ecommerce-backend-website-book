const User = require('../models/user')
const { errorHandler } = require('../helpers/dbErrorHandler')
const braintree = require('braintree')
require('dotenv').config()

const gateWay = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
})

exports.generateToken = (req, res) => {
  gateWay.clientToken.generate({}, (error, response) => {
    if (error) {
      res.status(500).send(error)
    } else {
      res.send(response)
    }
  })
}
exports.processPayment = (req, res) => {
  let nonceFromTheClient = req.body.paymentMethodNonce
  let amountFromTheClient = req.body.amount
  // charge
  let newTransaction = gateWay.transaction.sale(
    {
      amount: amountFromTheClient,
      paymentMethodNonce: nonceFromTheClient,
      options: {
        submitForSettlement: true,
      },
    },
    (error, result) => {
      if (error) {
        res.status(500).json(error)
      } else {
        res.json(result)
      }
    }
  )
}
