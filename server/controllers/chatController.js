const Chat = require("../models/chatModel");
const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");

//create chat
const createChat = asyncHandler(async (req, res) => {
  const chat = new Chat(req.body);
  await chat.save();
  const data = await chat.populate("members");
  res.status(201).json({
    success: true,
    data: data,
  });
});

//get all chats
const getChats = asyncHandler(async (req, res) => {
  const allChats = await Chat.find({
    members: { $in: [req.user._id] },
  })
    .populate("members")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });
  const chatsWithLastMessage = allChats.filter((chat) => chat.lastMessage);
  res.status(200).json({
    success: true,
    data: chatsWithLastMessage,
  });
});
//clear unread message
const clearMessage = asyncHandler(async (req, res) => {
  // Update unread message count to 0
  const chat = await Chat.findById(req.params.chatId);
  if (!chat) {
    return res.status(404).json({ error: "Chat không tồn tại" });
  }
  const messages = await Message.updateMany(
    { chat: req.params.chatId },
    { isRead: true }
  );
  const newChat = await Chat.findByIdAndUpdate(
    req.params.chatId,
    { unreadMessage: 0 },
    { new: true }
  );
  res.status(200).json({
    success: true,
    newChat,
    messages,
  });
});

module.exports = { createChat, getChats, clearMessage };
