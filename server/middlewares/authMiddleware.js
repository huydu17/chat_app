const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const isLogin = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401);
      throw new Error("Vui lòng đăng nhập");
    }
    const verifyToken = await jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(verifyToken.id);
    if (!user) {
      res.status(404);
      throw new Error("Người dùng không tồn tại");
    }
    req.user = user;
    next();
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = isLogin;
