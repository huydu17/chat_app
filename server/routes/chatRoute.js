const {
  createChat,
  getChats,
  clearMessage,
} = require("../controllers/chatController");
const isLogin = require("../middlewares/authMiddleware");

const chatRoute = require("express").Router();

//create chat
chatRoute.post("/createChat", isLogin, createChat);
//get chats
chatRoute.get("/", isLogin, getChats);
//clear message
chatRoute.post("/clearUnreadMsg/:chatId", isLogin, clearMessage);
module.exports = chatRoute;
