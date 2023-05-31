const jwt = require('jsonwebtoken');
const User = require('../models/user.models');

const { JWT_SECRET } = process.env;

module.exports = async (socket, next) => {
  const data = await jwt.verify(socket.handshake.headers.token, JWT_SECRET);
  const user = await User.findById(data.id);
  if (user) {
    socket.user = user;
  }
  next();
};
