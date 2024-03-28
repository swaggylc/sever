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
    console.log("连接数据库成功--user");
  }
});

/**
 * @description: 获取用户列表接口
 * @param {}
 * @return {}
 */
router.get("/user_list", (req, res) => {
  let sql = "SELECT * FROM user";
  client.query(sql, (err, result) => {
    if (err) {
      res.send({
        code: 201,
        msg: "查询失败",
      });
    }
    if (result.length > 0) {
      // 删除密码
      result.forEach((item) => {
        delete item.password;
      });
      res.send({
        code: 200,
        msg: "查询成功",
        data: {
          result,
        },
      });
    } else {
      res.send({
        code: 201,
        msg: "查询失败",
      });
    }
  });
});

module.exports = router;
