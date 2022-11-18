const { dbUsers } = require("../database/schemas.js")
const { errorResponce } = require("../server-responce/error.js")
const { responce } = require("../server-responce/success.js")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")



function login() {

  return async (req, res) => {
    if (!req.body.loginPassword) return errorResponce(res, "Invalid request")

    try {
      const username = req.params.username

      const startFinding = await dbUsers.findOne({ username: username }).select("+password")

      const user = await startFinding

      if (!user) throw new Error("Wrong username or password")

      if (!user.active) throw new Error("User account inactive!")

      const verify = await bcrypt.compare(req.body.loginPassword, user.password)

      if (!verify) throw new Error("Wrong username or password")

      const token = jwt.sign({ username: username }, process.env.jwtkey, { expiresIn: "120d" })

      responce(res, "User signed in and verified", { token: token, username: user.username })

    }

    catch (err) {
      errorResponce(res, `${err || "server error"}`)
    }


  }
}


module.exports = { login }