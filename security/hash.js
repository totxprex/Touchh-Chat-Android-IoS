const bcrypt = require("bcryptjs")


const { errorResponce } = require("../server-responce/error.js")


function hashPassword() {

  return async (req, res, next) => {
    if (req.body.password) {
      try {
        const newPass = await bcrypt.hash(req.body.password, 12)

        req.body.password = newPass
        next()
      }

      catch {
        errorResponce(res, "Error processing credentials")
      }
    }

    else next()
  }
}

module.exports = { hashPassword }
