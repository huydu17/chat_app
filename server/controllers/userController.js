const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const validateEmail = require("../utils/validateEmail");
const jwt = require("jsonwebtoken");
//register
const register = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;
  const userExist = await User.findOne({ email });
  if (!userName || !email || !password) {
    res.status(400);
    throw new Error("Vui lòng nhập tất cả thông tin");
  }
  if (userExist) {
    res.status(400);
    throw new Error("Tài khoản đã tồn tại");
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
  }
  if (!validateEmail(email)) {
    res.status(400);
    throw new Error("Email không hợp lệ");
  }
  const user = new User({ userName, email, password });
  //generate token
  const token = await generateToken(user._id);
  //send cookiere
  res.cookie("token", token, {
    secure: true,
    httpOnly: true,
    sameSite: "strict",
    expires: new Date(Date.now() + 1000 * 86400),
  });
  await user.save();
  res.status(201).json({
    success: true,
    message: "Đăng ký thành công",
    data: user,
    token: token,
  });
});
//login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Vui lòng nhập tất cả thông tin");
  }
  if (!validateEmail(email)) {
    res.status(400);
    throw new Error("Email không hợp lệ");
  }
  const userExist = await User.findOne({ email });
  if (!userExist) {
    res.status(400);
    throw new Error("Người dùng không tồn tại");
  }
  const isMatch = await bcrypt.compare(password, userExist.password);
  const token = await generateToken(userExist._id);
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    expires: new Date(Date.now() + 1000 * 86400),
    secure: process.env.NODE_ENV === "production",
  });
  if (isMatch) {
    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: userExist,
      token: token,
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Tài khoản hoặc mật khẩu không đúng",
    });
  }
});
//get usser
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("Không tìm thấy người dùng");
  }
  res.status(200).json({
    success: true,
    data: user,
  });
});
//send code
const sendCode = asyncHandler(async (req, res) => {
  const { email } = req.params;
  console.log("Email", req.params);
  const user = await User.findOne({ email: email });
  if (!user) {
    res.status(404);
    throw new Error("Tài khoản không tồn tại");
  }
  const userToken = await Token.findOne({
    userId: user._id,
    expiresAt: { $gt: Date.now() },
  });
  console.log("Token", userToken);
  if (!userToken) {
    res.status(404);
    throw new Error("Token không tồn tại");
  }
  const loginCode = userToken.lToken;
  const decryptedString = cryptr.decrypt(loginCode);
  console.log("ma xac nhan", decryptedString);
  const subject = "Mã xác nhận";
  const sent_to = user.email;
  const sent_from = process.env.EMAIL_USER;
  const reply_to = process.env.EMAIL_USER;
  const template = "sendLoginCode";
  const name = user.userName;
  const link = decryptedString;
  try {
    await sendEmail(
      subject,
      sent_to,
      sent_from,
      reply_to,
      template,
      name,
      link
    );
    res.status(200).json({
      status: true,
      message: "Gửi email thành công",
    });
  } catch (e) {
    res.status(500);
    throw new Error(e.message);
  }
});
//get login status
const getLoginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }
  try {
    const verify = jwt.verify(token, process.env.JWT_SECRET);
    if (verify) {
      return res.json(true);
    }
  } catch (err) {
    return res.json(false);
  }
  return res.json(false);
});

//verify register with code
const verifyWithCode = asyncHandler(async (req, res) => {
  const { email } = req.params;
  const { loginCode } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    res.status(404);
    throw new Error("Tài khoản không tồn tại");
  }
  const userToken = await Token.findOne({
    userId: user._id,
    expiresAt: { $gt: Date.now() },
  });
  if (!userToken) {
    res.status(404);
    throw new Error("Token không tồn tại");
  }
  const decryptToken = cryptr.decrypt(userToken.lToken);
  console.log("ma xac nhan 2", decryptToken);
  console.log("ma xac nhan 3", loginCode);
  if (decryptToken !== loginCode) {
    res.status(400);
    throw new Error("Mã xác nhận không đúng");
  } else {
    const ua = parser(req.headers["user-agent"]);
    const thisUserAgent = ua.ua;
    user.userAgent.push(thisUserAgent);
    user.save();
    //generate cookie
    const token = await generateToken(user._id);
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
      sameSite: "none",
      secure: true,
    });
    res.status(200).json({
      status: true,
      message: "Đăng nhập thành công",
      data: user,
      token: token,
    });
    res.status(200).json({
      status: true,
      message: "Đăng nhập thành công",
    });
  }
});

//get all users
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } });
  res.status(200).json({
    success: true,
    data: users,
    message: "Lấy tất cả người dùng",
  });
});
//update profile pic
const updateProfilePic = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Ảnh không được gửi");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      profilePic: req.file.path,
    },
    {
      new: true,
    }
  );
  res.status(200).json({
    success: "Cập nhật thành công",
    data: user,
  });
});
//update user
const updateUser = asyncHandler(async (req, res) => {
  const { userName } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("Không tìm thấy người dùng");
  }
  user.userName = userName;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Cập nhật thành công!",
    data: user,
  });
});

//change password
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  console.log(req.body.oldPassword);
  console.log(req.body.newPassword);

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("Tài khoản không tồn tại");
  }
  if (!oldPassword || !newPassword) {
    res.status(404);
    throw new Error("Vui lòng nhập tất cả thông tin");
  }
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  console.log(isMatch);
  if (!isMatch) {
    res.status(400);
    throw new Error("Mật khẩu cũ không đúng");
  }
  user.password = newPassword;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Đổi mật khẩu thành công",
  });
});

//logout
const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  console.log(req.cookies.token);
  return res.status(200).json("Đăng xuất thành công!");
});

module.exports = {
  register,
  login,
  getUser,
  logout,
  getLoginStatus,
  getAllUsers,
  updateUser,
  changePassword,
  updateProfilePic,
};
