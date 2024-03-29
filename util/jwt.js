const jwt = require("jsonwebtoken");

const processSecret = "lucan0417";

module.exports = {
  createToken: (user) => {
    return jwt.sign({ user }, processSecret, {
      expiresIn: 60 * 60 * 24 * 3,
    });
  },
  verifyToken: (token) => {
    return jwt.verify(token, processSecret);
  },
};
