const express = require("express");
const app = express();
require("dotenv").config();
const http = require("http");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const connect = require("./config/dbConfig");
const { notFound, errHandle } = require("./middlewares/errorHandle");
const userRoute = require("./routes/userRoute");
const chatRoute = require("./routes/chatRoute");
const messageRoute = require("./routes/messageRoute");
const { Server } = require("socket.io");
app.use(
  cors({
    origin: ["http://localhost:3000", "https://chap-app.vercel.app"],
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
//cookie
app.use(cookieParser());
app.use(bodyParser.json());
//CORS

/*Routes */
//user route
app.use("/api/users/", userRoute);
//chat routes
app.use("/api/chats/", chatRoute);
//message routes
app.use("/api/messages/", messageRoute);

//error handle
app.use("*", notFound);
app.use("/", errHandle);

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
connect().then(async () => {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://chap-app.vercel.app"],
    credentials: true,
  },
});
let userOnline = [];
io.on("connection", (socket) => {
  socket.on("join-room", (user) => {
    socket.join(user);
  });
  //send msg
  socket.on("send-message", (data) => {
    io.to(data.members[0]).to(data.members[1]).emit("receive-message", data);
  });
  //clear unreadmessage
  socket.on("clear-unread-msg-req", (data) => {
    io.to(data.members[0])
      .to(data.members[1])
      .emit("clear-unread-msg-res", data);
  });
  //typing
  socket.on("typing", (data) => {
    io.to(data.members[0]).to(data.members[1]).emit("typing-res", data);
  });
  //user online
  socket.on("came-on", (data) => {
    console.log(data);
    userOnline.push(data);
    io.emit("user-online", userOnline);
  });
  //update user list
  socket.on("update-user-list", (data) => {
    io.to(data.members[0])
      .to(data.members[1])
      .emit("update-user-list-res", data);
  });
  //update user list
  socket.on("went-offline", (data) => {
    userOnline = userOnline.filter((user) => user !== data.userId);
    io.emit("user-online-updated", data);
  });
});
