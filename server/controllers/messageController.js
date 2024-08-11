const Message = require("../models/messageModel");
const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
//create message
const createMessage = asyncHandler(async (req, res) => {
  if (!req.body.text && !req.file) {
    res.status(400);
    throw new Error("Vui lòng nhập tin nhắn");
  }
  const message = new Message(req.body);
  if (req.file) {
    message.image = req.file.path;
  }
  const newMessage = await message.save();
  const chat = await Chat.findByIdAndUpdate(
    req.body.chat,
    {
      lastMessage: newMessage,
      $inc: { unreadMessage: 1 },
    },
    {
      new: true,
    }
  );
  res.status(201).json({ success: true, data: newMessage, chat });
});

//get messages
const getMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ chat: req.params.chatId });
  res.status(200).json({
    success: true,
    data: messages,
  });
});

module.exports = { createMessage, getMessages };
