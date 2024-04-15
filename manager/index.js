const express = require("express");
const mysql = require("mysql");
const router = express.Router();

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
    console.log("连接数据库成功--manager");
  }
});

// 获取所有管理员信息
router.get("/get_manager", (req, res) => {
  const sql = "SELECT * FROM manager_user";
  client.query(sql, (err, result) => {
    if (err) {
      res.send({ code: 201, message: "获取管理员信息失败！" });
    } else {
      res.send({
        code: 200,
        message: "获取管理员信息成功！",
        data: result,
      });
    }
  });
});

module.exports = router;
