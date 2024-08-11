const {
  createMessage,
  getMessages,
} = require("../controllers/messageController");
const isLogin = require("../middlewares/authMiddleware");
const fileUpload = require("../config/cloudinary");
const messageRoute = require("express").Router();
//create message
messageRoute.post(
  "/createMessage",
  isLogin,
  fileUpload.single("file"),
  createMessage
);
//get messages
messageRoute.get("/getMessages/:chatId", isLogin, getMessages);

module.exports = messageRoute;
