const express = require("express");
const mysql = require("mysql");
const router = express.Router();
const jwtObj = require("../util/jwt");

//2.建立与 mysql 数据库的联系
const client = mysql.createPool({
  host: "127.0.0.1", //数据库的 ip 地址
  user: "root", //登陆数据库的账号
  password: "admin123", //登陆数据库的密码
  database: "manager_db", //要操作哪个数据库
});

// 3.检测是否连接成功
client.getConnection(function (err, connection) {
  if (err) {
    console.log("连接失败:" + err.message);
  } else {
    console.log("连接数据库成功--home");
  }
});

/**
 * @description: 登录接口
 * @param {}
 * @return {}
 */
router.get("/login", (req, res) => {
  let { account, password } = req.query;
  console.log(account, password);
  let sql = "SELECT * FROM user WHERE account = ? AND password = ?;";
  client.query(sql, [account, password], (err, result) => {
    console.log(result);
    if (err) {
      res.send({
        code: 201,
        msg: "账号或密码错误",
      });
    }
    if (result.length > 0) {
      let token = jwtObj.createToken(result[0]);
      res.send({
        code: 200,
        msg: "登录成功",
        data: {
          token,
          account: result[0].account,
          username: result[0].username,
        },
      });
    } else {
      res.send({
        code: 201,
        msg: "账号或密码错误",
      });
    }
  });
});

module.exports = router;
