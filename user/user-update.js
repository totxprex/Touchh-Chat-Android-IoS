const { dbUsers } = require("../database/schemas.js")
const { errorResponce } = require("../server-responce/error.js")
const { responce } = require("../server-responce/success.js")



function updateUser() {

  return async (req, res) => {
    try {
      const body = {}

      if (req.body.email) body.email = req.body.email
      if (req.body.password) body.password = req.body.password
      if (req.body.about) body.about = req.body.about

      await dbUsers.findByIdAndUpdate(req.params.id, body, { runValidators: true })

      responce(res, "User properties updated")

    }

    catch (err) {
      errorResponce(res, `${err || "Error getting user"}`)
    }
  }
}





module.exports = { updateUser }