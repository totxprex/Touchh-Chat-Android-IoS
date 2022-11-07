const jwt = require("jsonwebtoken")
const { errorResponce } = require("../server-responce/error.js")


const verifyToken = function () {

  return (req, res, next) => {
    const token = req.params.token

    jwt.verify(token, process.env.jwtkey, (err, obj) => {
      if (err) return errorResponce(res, "Authentication failed")

      else {
        req.username = obj.username
        next()
      }
    })
  }
}



module.exports = { verifyToken }