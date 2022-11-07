

const responce = function (resObj, status, data) {
  return resObj.status(200).header({
    "content-type": "application/json"
  }).send({
    status: status || "Request Succesful",
    data: data || "No data"
  })

}


module.exports = { responce }