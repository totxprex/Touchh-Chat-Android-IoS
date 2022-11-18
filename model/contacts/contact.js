const express = require("express")
const { responce } = require("../../server-responce/success.js")
const { errorResponce } = require("../../server-responce/error.js")
const { dbUsers, dbRooms } = require("../../database/schemas.js")


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




//remove a user from your contact list
contactApp.patch("/remove/contact/:userID/:toBeRemovedID", async (req, res) => {
  try {
    const userId = req.params.userID
    const toBeRemovedId = req.params.toBeRemovedID

    const userFirst = await dbUsers.findById(userId)
    const userSecond = await dbUsers.findById(toBeRemovedId)

    const userFistMod = userFirst.contactList.filter((e) => String(e) !== toBeRemovedId)

    const userSecondMod = userSecond.contactList.filter((e) => String(e) !== userId)

    await dbUsers.findByIdAndUpdate(userId, { contactList: userFistMod }, { runValidators: true })

    await dbUsers.findByIdAndUpdate(toBeRemovedId, { contactList: userSecondMod }, { runValidators: true })


    //find the room they have in common in rooms collection
    let roomIdToKill

    const startFindingRoomCheckOne = dbUsers.findById(userId).populate("rooms")

    const roomCheckOne = await startFindingRoomCheckOne

    roomCheckOne.rooms.forEach((e) => {
      if (String(e.firstUser) == userId && String(e.secondUser) == toBeRemovedId) roomIdToKill = String(e._id)
    })

    roomCheckOne.rooms.forEach((e) => {
      if (String(e.firstUser) == toBeRemovedId && String(e.secondUser) == userId) roomIdToKill = String(e._id)
    })



    //delete room in both users array
    const userFirtRoomsMod = userFirst.rooms.filter((el) => {

      return String(el) !== roomIdToKill
    })

    const userSecondRoomsMod = userSecond.rooms.filter((el) => {

      return String(el) !== roomIdToKill
    })


    const userFirtUnReadMod = userFirst.unReadRooms.filter((el) => {

      return String(el) !== roomIdToKill
    })

    const userSecondUnReadMod = userSecond.unReadRooms.filter((el) => {

      return String(el) !== roomIdToKill
    })


    await dbUsers.findByIdAndUpdate(userId, { rooms: userFirtRoomsMod, unReadRooms: userFirtUnReadMod }, { runValidators: true })

    await dbUsers.findByIdAndUpdate(toBeRemovedId, { rooms: userSecondRoomsMod, unReadRooms: userSecondUnReadMod }, { runValidators: true })


    //delete room in rooms collection
    await dbRooms.findByIdAndDelete(roomIdToKill)


    responce(res, "User removed from contact list")
  }

  catch (err) {
    errorResponce(res, `${err || "Server error"}`)
  }

})


module.exports = { contactApp }