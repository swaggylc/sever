const jwt = require("jsonwebtoken");

const processSecret = "lucan0417";

module.exports = {
  createToken: (user) => {
    return jwt.sign({ user }, processSecret, {
      expiresIn: 3600 * 24,
    });
  },
  verifyToken: (token) => {
    return jwt.verify(token, processSecret);
  },
};
