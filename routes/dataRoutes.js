const { data } = require("../controllers/dataController")


const dataRouter = require("express").Router()



dataRouter.post("/submit", data)


module.exports = { dataRouter }