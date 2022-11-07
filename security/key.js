const { errorResponce } = require("../server-responce/error.js")

const verifyKey = function () {

  return (req, res, next) => {
    if (req.params.key !== "1680") return errorResponce(res, "Invalid API Key")

    else next()
  }
}


module.exports = { verifyKey }