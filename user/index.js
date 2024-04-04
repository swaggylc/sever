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

/**
 * @description: 搜索用户接口
 * @param {}
 * @return {}
 */
router.get("/search_user", (req, res) => {
  // 获取前端传过来的参数
  let { name, sex } = req.query;
  // 拼接sql语句
  let sql = "SELECT * FROM user WHERE 1=1";
  let params = [];

  if (name) {
    sql += " AND name LIKE ?";
    params.push(`%${name}%`);
  }

  if (sex) {
    sql += " AND sex=?";
    params.push(sex);
  }

  client.query(sql, params, (err, result) => {
    if (err) {
      res.send({
        code: 201,
        msg: "查询失败",
      });
    }
    if (result.length > 0) {
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

/**
 * @description: 修改用户信息的接口
 * @param {}
 * @return {}
 */
router.post("/edit_user", (req, res) => {
  let { name, username, sex, address, uid } = req.body;
  let sql = "UPDATE user SET username=?,sex=?,address=?,name=? WHERE uid=?";
  client.query(sql, [username, sex, address, name, uid], (err, result) => {
    if (err) {
      res.send({
        code: 201,
        msg: "修改失败",
      });
    } else {
      res.send({
        code: 200,
        msg: "修改成功",
      });
    }
  });
});

/**
 * @description: 删除用户接口
 * @param {}
 * @return {}
 */
router.delete("/delete_user", (req, res) => {
  console.log(req.query);
  let { uid } = req.query;
  let sql = "DELETE FROM user WHERE uid=?";
  client.query(sql, [uid], (err, result) => {
    if (err) {
      res.send({
        code: 201,
        msg: "删除失败",
      });
    } else {
      res.send({
        code: 200,
        msg: "删除成功",
      });
    }
  });
});


module.exports = router;
