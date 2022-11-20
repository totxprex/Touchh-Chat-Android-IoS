const express = require("express")
const { dbRooms, dbUsers } = require("../../database/schemas")
const { responce } = require("../../server-responce/success.js")
const { errorResponce } = require("../../server-responce/error.js")
const { s3, upload } = require("../../aws/update-profile-pic.js")
const { PutObjectCommand } = require("@aws-sdk/client-s3")

const multer = require("multer")
const sharp = require("sharp")


const chatApp = express.Router()



//create a chat room 
chatApp.get("/create/:firstUserID/:secondUserID", async (req, res) => {
  try {
    const firstUserId = req.params.firstUserID
    const secondUserId = req.params.secondUserID

    const obj = {
      firstUser: firstUserId,
      secondUser: secondUserId
    }

    const room = await dbRooms.create(obj)

    responce(res, "Room created", room._id)

  }

  catch (err) {
    errorResponce(res, `${err || "Server error"}`)
  }
})




//Send a message
chatApp.post("/send/message/:roomID", upload.single("image"), async (req, res) => {

  const messageObj = req.body
  const userSendingtheMessageUsername = req.body.senderUsername

  try {
    if (req.file?.buffer) {

      const filename = `message-${messageObj.senderUsername}-${Date.now()}.jpeg`

      const buffer = await sharp(req.file.buffer).resize(400, 400).toFormat("jpeg").jpeg({ quality: 80 }).toBuffer()

      const command = new PutObjectCommand({
        Key: filename,
        Body: buffer,
        mimetype: req.file.mimetype,
        Bucket: process.env.awsBucketName
      })

      await s3.send(command)

      messageObj.image = filename

    }

    const { messages, firstUser, secondUser } = await dbRooms.findById(req.params.roomID)

    messages.push(messageObj)

    await dbRooms.findByIdAndUpdate(req.params.roomID, { messages: messages }, { runValidators: true })


    //mark message for other user as unread by adding the room id to the users unread arr if not there
    const userOne = await dbUsers.findById(firstUser)
    const userTwo = await dbUsers.findById(secondUser)

    let theUserToSendUnread

    if (userOne.username !== userSendingtheMessageUsername) theUserToSendUnread = userOne._id

    if (userTwo.username !== userSendingtheMessageUsername) theUserToSendUnread = userTwo._id


    const { unReadRooms } = await dbUsers.findById(theUserToSendUnread)

    const confirmIfNotThereFirt = unReadRooms.find((e) => {
      return String(e) == req.params.roomID
    })

    if (!confirmIfNotThereFirt) {
      unReadRooms.push(req.params.roomID)
      await dbUsers.findByIdAndUpdate(theUserToSendUnread, { unReadRooms: unReadRooms }, { runValidators: true })
    }


    responce(res, "Messages sent", messageObj)
  }

  catch (err) {
    errorResponce(res, `${err || "Server error"}`)
  }
})



//delete a message
chatApp.delete("/delete/message/:roomID/:messageID", async (req, res) => {
  try {
    const message = req.params.messageID
    const room = req.params.roomID

    const { messages } = await dbRooms.findById(room)

    const newMesages = messages.filter((e) => {
      return String(e._id) !== message
    })

    await dbRooms.findByIdAndUpdate(room, { messages: newMesages })

    responce(res, "Message deleted")
  }

  catch (err) {
    errorResponce(res, `${err || "Server error"}`)
  }

})



//Get a room
chatApp.get("/get/room/:roomID", async (req, res) => {
  try {
    const roomID = req.params.roomID

    const startFinding = dbRooms.findById(roomID).populate({
      path: "firstUser",
      select: "name username photo gender"
    }).populate({
      path: "secondUser",
      select: "name username photo gender"
    })

    const room = await startFinding

    responce(res, "Found room", room)
  }
  catch (err) {
    errorResponce(res, `${err || "Server error"}`)
  }
})




//mark all messages in a room as read for a particlular user
chatApp.get("/read/room/:roomID/:userID", async (req, res) => {

  try {
    const room = req.params.roomID
    const user = req.params.userID

    let { unReadRooms } = await dbUsers.findById(user)

    unReadRooms = unReadRooms.filter((e) => {
      return String(e) !== room
    })

    await dbUsers.findByIdAndUpdate(user, { unReadRooms: unReadRooms }, { runValidators: true })

    responce(res, "Message marked as read for user")

  }

  catch (err) {
    errorResponce(res, `${err || "Server error"}`)
  }
})










module.exports = { chatApp }