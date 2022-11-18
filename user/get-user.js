const { dbUsers } = require("../database/schemas.js")
const { errorResponce } = require("../server-responce/error.js")
const { responce } = require("../server-responce/success.js")


function getUser() {

  return async (req, res) => {
    try {
      if (req.params.username) {
        const startFinding = dbUsers.findOne({ username: req.params.username }).populate({
          path: "contactList",
          select: "name username photo gender email createdAt about"
        }).populate({
          path: "rooms"
        })

        const user = await startFinding

        responce(res, "Found a user by username", user)
      }
      else if (req.query.id) {

        const startFinding = dbUsers.findById(req.query.id).populate({
          path: "contactList",
          select: "name username photo gender email createdAt about"
        }).populate({
          path: "rooms"
        })

        const user = await startFinding

        responce(res, "Found a user by id", user)
      }
    }

    catch (err) {
      errorResponce(res, `${err || "Error getting user"}`)
    }
  }
}


module.exports = { getUser }