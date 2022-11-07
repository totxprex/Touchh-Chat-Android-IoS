const express = require("express")
const { responce } = require("../../server-responce/success.js")
const { errorResponce } = require("../../server-responce/error.js")
const { dbUsers } = require("../../database/schemas.js")


const contactApp = express()



//add a user to your contact list and update request
contactApp.patch("/add/:recieverID/:userToAddId", async (req, res) => {
  try {
    const user = req.params.recieverID
    const toAdd = req.params.userToAddId

    const { contactList, username, addRequests } = await dbUsers.findById(user)

    contactList.forEach((e) => {
      if (String(e) == toAdd) throw new Error("User already in contact list")
    })

    contactList.push(toAdd)

    await dbUsers.findByIdAndUpdate(user, { contactList: contactList }, { runValidators: true })

    const toAddUser = await dbUsers.findById(toAdd)

    toAddUser.contactList.forEach((e) => {
      if (String(e) == user) throw new Error("User already in contact list")
    })

    toAddUser.contactList.push(user)

    await dbUsers.findByIdAndUpdate(toAdd, { contactList: toAddUser.contactList }, { runValidators: true })


    //update add request
    const requestsUpdated = addRequests.map((e) => {
      if (e.fromUsername === toAddUser.username) {
        e.status = "accepted"
        return e
      }

      return e
    })


    await dbUsers.findByIdAndUpdate(user, { addRequests: requestsUpdated }, { runValidators: true })


    responce(res, `User added to ${username}'s contact list`)
  }
  catch (err) {
    errorResponce(res, `${err || "Server error"}`)
  }
})




//send a add user request
contactApp.patch("/request/:recieverID/:userRequestingId", async (req, res) => {

  try {
    const user = req.params.recieverID
    const toAdd = req.params.userRequestingId

    const userRequestingDetails = await dbUsers.findById(toAdd)

    const requestObj = {
      fromName: userRequestingDetails.name,
      fromUsername: userRequestingDetails.username,
      fromID: userRequestingDetails._id,
      status: "pending"
    }

    const { addRequests, name } = await dbUsers.findById(user)

    addRequests.find((e) => {
      if (e.fromUsername === userRequestingDetails.username) throw new Error("Request already sent previously")
    })

    addRequests.push(requestObj)

    await dbUsers.findByIdAndUpdate(user, { addRequests: addRequests }, { runValidators: true })

    responce(res, `A connect/add request has been sent to ${name}`)
  }

  catch (err) {
    errorResponce(res, `${err || "Server error"}`)
  }

})




//Delete a request
contactApp.delete("/delete/:userID/:requestID", async (req, res) => {
  try {
    const request = req.params.requestID
    const user = req.params.userID

    const { addRequests } = await dbUsers.findById(user)

    const mod = addRequests.filter(function (e) {
      return String(e._id) !== request
    })

    await dbUsers.findByIdAndUpdate(user, { addRequests: mod }, { runValidators: true })

    responce(res, "Request deleted")

  }

  catch (err) {
    errorResponce(res, `${err || "Server error"}`)
  }


})



module.exports = { contactApp }