const { model } = require("mongoose")
const { dbUsers } = require("../database/schemas.js")
const { errorResponce } = require("../server-responce/error.js")
const { responce } = require("../server-responce/success.js")


const deactivate = function () {

  return async (req, res) => {
    try {
      const user = req.params.id

      const foundUser = await dbUsers.findById(user)

      if (!foundUser.active) throw new Error("Account already de-activated")

      await dbUsers.findByIdAndUpdate(user, { active: false })

      responce(res, "Account de-activated")
    }
    catch (err) {
      errorResponce(res, `${err || "Error deleting account"}`)
    }

  }
}


module.exports = { deactivate }