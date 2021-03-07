exports.userSignUpValidator = (req, res, next) => {
  req.check('name', 'name is required').notEmpty()
  req
    .check('email', 'email must be between 3 to 32 character')
    .matches('^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$')
    .withMessage('this is not valid email')
    .isLength({
      min: 4,
      max: 32,
    })
  req.check('password', 'password is required').notEmpty()
  req
    .check('password')
    .isLength({ min: 6 })
    .withMessage('password must contain at least six words')
    .matches(/\d/)
    .withMessage('password must contain a number')

  const errors = req.validationErrors()

  if (errors) {
    const firstError = errors.map((error) => {
      return error.msg
    })[0]
    return res.status(400).json({ error: firstError })
  }
  next()
}
