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

    await dbRooms.create(obj)

    responce(res, "Room created")

  }

  catch (err) {
    errorResponce(res, `${err || "Server error"}`)
  }
})




//Send a message
chatApp.post("/send/message/:roomID", upload.single("image"), async (req, res) => {

  const messageObj = req.body

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

    const { messages } = await dbRooms.findById(req.params.roomID)

    messages.push(messageObj)

    await dbRooms.findByIdAndUpdate(req.params.roomID, { messages: messages }, { runValidators: true })

    responce(res, "Messages sent")
  }

  catch (err) {
    errorResponce(res, `${err || "Server error"}`)
  }
})



//delete a message
chatApp.delete("/delete/message/:roomID/:messageID", async (req, res) => {
  const message = req.params.messageID
  const room = req.params.roomID

  const { messages } = await dbRooms.findById(room)

  const newMesages = messages.filter((e) => {
    return String(e._id) !== message
  })

  await dbRooms.findByIdAndUpdate(room, { messages: newMesages })

  responce(res, "Message deleted")

})



//Get a room










module.exports = { chatApp }