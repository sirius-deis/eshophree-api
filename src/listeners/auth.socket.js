const jwt = require('jsonwebtoken');
const User = require('../models/user.models');

const { JWT_SECRET } = process.env;

module.exports = async (socket, next) => {
  const { token } = socket.handshake.headers;
  if (!token) {
    return next();
  }
  const data = await jwt.verify(token, JWT_SECRET);
  const user = await User.findById(data.id);
  if (user) {
    socket.user = user;
  }
  next();
};
