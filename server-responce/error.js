const errorResponce = function (resObj, message) {
  return resObj.status(404).header({
    "content-type": "application/json"
  }).send({
    status: "Internal Server Error",
    message: message || "Some error occured"
  })

}


module.exports = { errorResponce }