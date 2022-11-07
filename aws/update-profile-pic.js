const multer = require("multer")
const sharp = require("sharp")
const express = require("express")
const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3")
const { errorResponce } = require("../server-responce/error.js")
const { responce } = require("../server-responce/success.js")
const { dbUsers } = require("../database/schemas")

const upload = multer({ storage: multer.memoryStorage() })

const s3 = new S3Client({
  region: process.env.awsBucketRegion,
  credentials: {
    accessKeyId: process.env.awsAccessKeyId,
    secretAccessKey: process.env.awsSecretAccessKey
  }
})

const profilePicUpdateApp = express.Router()


profilePicUpdateApp.patch("/:username", upload.single("photo"), async (req, res) => {
  if (!req.file.buffer) throw new Error("Invalid file")

  try {
    const filename = `user-${req.params.username}-${Date.now()}.jpeg`

    const buffer = await sharp(req.file.buffer).resize(300, 300).toFormat("jpeg").jpeg({ quality: 80 }).toBuffer()

    const command = new PutObjectCommand({
      Bucket: process.env.awsBucketName,
      Key: filename,
      Body: buffer,
      mimetype: req.file.mimetype
    })
    
    await s3.send(command)

    await dbUsers.findOneAndUpdate({ username: req.params.username }, { photo: filename }, { runValidators: true })

    responce(res, "User profile picture updated", { filename: filename })
  }
  catch (err) {
    errorResponce(res, err)
  }

})


module.exports = { profilePicUpdateApp, s3, upload }