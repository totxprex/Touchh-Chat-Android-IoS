const express = require("express")
const { dbUsers } = require("../../database/schemas")
const { responce } = require("../../server-responce/success.js")
const { errorResponce } = require("../../server-responce/error.js")


const newsApp = express.Router()


//save a news 

newsApp.post("/save/:userID", async (req, res) => {
  try {
    const newsBody = req.body
    const user = req.params.userID

    const { savedNews } = await dbUsers.findById(user)

    savedNews.push(newsBody)

    await dbUsers.findByIdAndUpdate(user, { savedNews: savedNews }, { runValidators: true })

    responce(res, "News added to collection")
  }
  catch (err) {
    errorResponce(res, `${err || "Server error"}`)
  }
})


//remove saved news
newsApp.delete("/delete/:userID/:newsID", async (req, res) => {
  try {
    const newsID = req.params.newsID
    const user = req.params.userID

    const { savedNews } = await dbUsers.findById(user)

    let newArr = savedNews.filter((e) => {
      return String(e._id) !== newsID
    })

    await dbUsers.findByIdAndUpdate(user, { savedNews: newArr }, { runValidators: true })

    responce(res, "News removed from user collection")

  }

  catch (err) {
    errorResponce(res, `${err || "Server error"}`)
  }
})



module.exports = { newsApp }