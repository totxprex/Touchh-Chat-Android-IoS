const { dbUsers } = require("../database/schemas.js")
const { errorResponce } = require("../server-responce/error.js")
const { responce } = require("../server-responce/success.js")
const { sendMail } = require("../utilities/nodemailer.js")
const { emitEmailPage } = require("../view/emailHtml")

function signUp() {

  return async (req, res) => {
    if (!req.body.name) return errorResponce(res, "Invalid signup body")

    try {

      await dbUsers.create(req.body)

      const options = {
        from: "info@touchh.com",
        to: req.body.email,
        subject: "Welcome to Touchh!",
        html: emitEmailPage(`Hello ${req.body.name}.<br><br>Welcome to Touchh chat app. You can now login to our application.<br><br>Chat with friends and family real-time, and explore and connect with thousands of other users.`),
        text: `Hello ${req.body.name}.\n\nWelcome to Touchh chat app. You can now login to our application.\n\nChat with friends and family real-time, and explore and connect with thousands of other users.`
      }

      sendMail(options)

      responce(res, "User signed up")
    }
    catch (err) {
      errorResponce(res, err.message)
    }
  }
}


module.exports = { signUp }