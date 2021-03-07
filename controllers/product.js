const fs = require('fs')
const Product = require('../models/product')
const { errorHandler } = require('../helpers/dbErrorHandler')
const formidable = require('formidable')
const _ = require('lodash')

// Method: Get
// route: /product/:productId

exports.read = (req, res) => {
  req.product.photo = undefined
  res.status(302).json(req.product)
}

// Method: Post
// route: /product/create/:userId

exports.create = (req, res) => {
  let form = new formidable.IncomingForm()

  form.keepExtensions = true
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: 'image could not uploaded' })
    }

    let product = new Product(fields)

    if (files.photo) {
      // checking image size
      if (files.photo.size > 1000000) {
        return res
          .status(400)
          .json({ error: 'image size should less than 1mb ' })
      }
      product.photo.data = fs.readFileSync(files.photo.path)
      product.photo.contentType = files.photo.type
    }

    // checking for fields

    const { name, description, price, category, shipping, qty } = fields

    if (!name || !description || !price || !category || !shipping || !qty) {
      return res.status(400).json({ error: 'All fields are required' })
    }
    product.save((err, result) => {
      if (err) {
        return res.status(400).json({ error: errorHandler(err) })
      }
      res.status(201).json(result)
    })
  })
}

// Method: Get
// route: /api/category/create/:userId

exports.productById = (req, res, next, id) => {
  Product.findById(id)
    .populate('category')
    .exec((err, product) => {
      if (!product || err) {
        return res.status(404).json({ error: 'Product Not Found' })
      }

      req.product = product
      next()
    })
}

// Method: Delete
// route: /product/:productId/:userId

exports.remove = (req, res) => {
  const product = req.product
  product.remove((err, deletedProduct) => {
    if (err) {
      return res.status(404).json({ message: 'product not found' })
    }

    res
      .status(410)
      .json({ message: `${product.name} has been successfully deleted` })
  })
}

// Method: Put
// route: /product/:productId/:userId

exports.update = (req, res) => {
  let form = new formidable.IncomingForm()

  form.keepExtensions = true
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({ message: 'image could not uploaded' })
    }

    // checking for fields

    const { name, description, price, category, shipping, qty } = fields

    // if (!name || !description || !price || !category || !shipping || !qty) {
    //   return res.status(400).json({ error: 'All fields are required' })
    // }

    let product = req.product
    product = _.extend(product, fields)

    if (files.photo) {
      // checking image size
      if (files.photo.size > 1000000) {
        return res
          .status(400)
          .json({ error: 'image size should less than 1mb ' })
      }
      product.photo.data = fs.readFileSync(files.photo.path)
      product.photo.contentType = files.photo.type
    }

    product.save((err, result) => {
      if (err) {
        return res.status(400).json({ error: errorHandler(err) })
      }
      res.status(201).json(result)
    })
  })
}

// sell / Arrival
// by Sell /products?sorBy=sold&order=desc&limit=4
// by arrival /products?sorBy=createdAt&order=desc&limit=4
// ** if no params is send then all products are returned

exports.list = (req, res) => {
  let order = req.query.order ? req.query.order : 'asc'
  let sortBy = req.query.sortBy ? req.query.sortBy : '_id'
  let limit = req.query.limit ? parseInt(req.query.limit) : 6

  Product.find()
    .select('-photo')
    .populate('category')
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((err, data) => {
      if (err || !data) {
        res.status(400).json({ message: 'Product not found' })
      }
      res.json(data)
    })
}

// It will find the product based on the req product category
// others products that has the same category will be returned

// Method: Get
// route: /products/related/:productId

exports.listRelated = (req, res) => {
  let limit = req.query.limit ? parseInit(req.query.limit) : 6

  Product.find({ _id: { $ne: req.product }, category: req.product.category })
    .limit(limit)
    .populate('category', '_id name')
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({ message: 'No product found' })
      }
      res.json(products)
    })
}

// listing out all the categories
// Method: Get
// route: /products/categories
exports.listCategories = (req, res) => {
  Product.distinct('category', {}, (err, categories) => {
    if (err) {
      return res.status(400).json({ message: 'No product found' })
    }
    res.json(categories)
  })
}

// Get The search product
// Method: Post
// route: products/by/search

/**
 * list products by search
 * we will implement product search in react frontend
 * we will show categories in checkbox and price range in radio buttons
 * as the user clicks on those checkbox and radio buttons
 * we will make api request and show the products to users based on what he wants
 */

exports.listBySearch = (req, res) => {
  let order = req.body.order ? req.body.order : 'desc'
  let sortBy = req.body.sortBy ? req.body.sortBy : '_id'
  let limit = req.body.limit ? parseInt(req.body.limit) : 100
  let skip = parseInt(req.body.skip)
  let findArgs = {}

  // console.log(order, sortBy, limit, skip, req.body.filters);
  // console.log("findArgs", findArgs);

  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === 'price') {
        // gte -  greater than price [0-10]
        // lte - less than
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        }
      } else {
        findArgs[key] = req.body.filters[key]
      }
    }
  }

  console.log(findArgs)

  Product.find(findArgs)
    .select('-photo')
    .populate('category')
    .sort([[sortBy, order]])
    .skip(skip)
    .limit(limit)
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: 'Products not found',
        })
      }
      res.json({
        size: data.length,
        data,
      })
    })
}

// Method: Get
// route: /product/photo/:productId
exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set('Content-Type', req.product.photo.contentType)
    return res.send(req.product.photo.data)
  }
  next()
}

// Method: Get
// route: /product/search
exports.listSearch = (req, res) => {
  const query = {}

  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: 'i' }
  }
  if (req.query.category && req.query.category != 'All') {
    query.category = req.query.category
  }
  console.log(query)

  Product.find(query, (err, products) => {
    if (err || !products) {
      return res.status(400).json(errorHandler(err))
    }
    res.json(products)
  }).select('-photo')
}

// order decreaseQuantity and update sold middleware
exports.decreaseQuantity = (req, res, next) => {
  let bulkOps = req.body.order.products.map((item) => {
    return {
      updateOne: {
        filter: { _id: item._id },
        update: { $inc: { qty: -item.count, sold: +item.count } },
      },
    }
  })

  Product.bulkWrite(bulkOps, {}, (error, products) => {
    if (error) {
      return res.status(400).json({ error: 'Could not update the product' })
    }
  })

  next()
}
