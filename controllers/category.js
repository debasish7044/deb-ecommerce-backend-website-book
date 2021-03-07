const Category = require('../models/category')
const { errorHandler } = require('../helpers/dbErrorHandler')

// Method: setting param

exports.categoryById = (req, res, next, id) => {
  Category.findById(id)
  .exec((err, category) => {
    if (err || !category) {
      return res.status(404).json({ message: 'category not found' })
    }
    req.category = category
    next()
  })
}

// Method: Get
// route: /category/create/:userId

exports.create = (req, res) => {
  const category = new Category(req.body)

  category.save((err, data) => {
    if (err || !data) {
      return res.status(400).json({ error: errorHandler(err) })
    }

    res.status(201).json({ data })
  })
}

// Method: Get
// route: /category/:categoryId

exports.read = (req, res) => {
  return res.json(req.category)
}

// Method: Put
// route: /category/:categoryId/:userId

exports.update = (req, res) => {
  const category = req.category
  category.name = req.body.name
  category.save((err, data) => {
    if (err) {
      res.status(400).json({
        error: errorHandler(err),
      })
    }
    res.status(201).json(data)
  })
}

// Method: Delete
// route: /category/:categoryId/:userId

exports.remove = (req, res) => {
  const category = req.category
  category.remove((err, data) => {
    if (err) {
      res.status(400).json({
        error: errorHandler(err),
      })
    }
    res
      .status(201)
      .json({ message: `${req.category.name} been successfully removed` })
  })
}
// Method: Get
// route: /categories

exports.list = (req, res) => {
  Category.find().exec((err, data) => {
    if (err) {
      res.status(400).json({
        error: errorHandler(err),
      })
    }
    res.json(data)
  })
}
