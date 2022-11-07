const nodemailer = require("nodemailer")


function sendMail(options) {

  const transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.mailtrapusername,
      pass: process.env.mailtrappassword
    }
  })

  transport.sendMail(options).then(() => {
    console.log("Email sent")
  }).catch((err) => console.log(err))
}


module.exports = { sendMail }