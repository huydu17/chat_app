const {
  register,
  login,
  getUser,
  logout,
  getLoginStatus,
  getAllUsers,
  updateProfilePic,
  changePassword,
  updateUser,
} = require("../controllers/userController");
const isLogin = require("../middlewares/authMiddleware");
const fileUpload = require("../config/cloudinary");
const userRoute = require("express").Router();

//register
userRoute.post("/register", register);
//login
userRoute.post("/login", login);
//get user
userRoute.get("/", isLogin, getUser);
//get login status
userRoute.get("/loginStatus", getLoginStatus);
//get login status
userRoute.get("/getUsers", isLogin, getAllUsers);
//update user
userRoute.patch("/updateUser", isLogin, updateUser);
//change pass
userRoute.patch("/changePass", isLogin, changePassword);
//update profile picture
userRoute.patch(
  "/update-pic",
  isLogin,
  fileUpload.single("file"),
  updateProfilePic
);
//logout
userRoute.post("/logout", logout);
module.exports = userRoute;
