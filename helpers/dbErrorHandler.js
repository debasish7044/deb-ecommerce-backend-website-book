const uniqueMessage = (error) => {
  let output
  try {
    let fieldName = error.message.substring(
      error.message.lastIndexOf('.$') + 2,
      error.message.lastIndexOf('_1')
    )
    //  E11000 duplicate key error collection: myFirstDatabase.users index: name_1 dup key: { name: "raj" }
    //  11000 duplicate key error collection: myFirstDatabase.users index: name
    output =
      fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' already exist'
  } catch (error) {
    output = 'unique field already exists'
  }
  return output
}

exports.errorHandler = (error) => {
  let message = ''

  if (error.code) {
    switch (error.code) {
      case 11000:
      case 11001:
        message = uniqueMessage(error)
        break
      default:
        message = 'Something went wrong'
    }
  } else {
    for (let errorName in error.errors) {
      if (error.errors[errorName].message)
        message - error.errors[errorName].message
    }
  }
  return message
}
