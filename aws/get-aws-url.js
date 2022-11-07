const { s3 } = require("./update-profile-pic.js")
const { GetObjectCommand } = require("@aws-sdk/client-s3")
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner")
const express = require("express")
const { errorResponce } = require("../server-responce/error.js")
const { responce } = require("../server-responce/success.js")


const getAwsUrlApp = express.Router()

getAwsUrlApp.get("/:filename", async (req, res) => {

  try {
    const filename = req.params.filename

    const command = new GetObjectCommand({
      Bucket: process.env.awsBucketName,
      Key: filename
    })

    const url = await getSignedUrl(s3, command)

    responce(res, "Found aws url", url)
  }

  catch (err) {
    errorResponce(res, err)
  }
})


module.exports = { getAwsUrlApp }