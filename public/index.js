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
  let sql;
  if (req.query.type == 0) {
    // 查询用户表
    sql = "SELECT * FROM user WHERE account = ? AND password = ?;";
  } else if (req.query.type == 1) {
    // 查询管理员表
    sql = "SELECT * FROM manager_user WHERE account = ? AND password = ?;";
  }
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
          type: result[0].type,
          uid: result[0].uid,
          name: result[0].name,
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

/**
 * @description: 用户注册接口
 * @param {}
 * @return {}
 */
router.post("/register", (req, res) => {
  let { account, username, password, name, sex, address } = req.body;
  let sql =
    "INSERT INTO user(account,username,password,name,sex,address) VALUES(?,?,?,?,?,?)";
  client.query(
    sql,
    [account, username, password, name, sex, address],
    (err, result) => {
      if (err) {
        res.send({
          code: 201,
          msg: "注册失败,请重新填写信息！",
          err: err,
        });
      } else {
        res.send({
          code: 200,
          msg: "注册成功",
        });
      }
    }
  );
});

// 下面是保修表的一些接口
/**
 * @description: 获取保修表数据
 * @param {}
 * @return {}
 */
router.get("/repair_list", (req, res) => {
  let sql = "SELECT * FROM repair_manage";
  client.query(sql, (err, result) => {
    if (err) {
      res.send({
        code: 201,
        msg: "获取保修表数据失败",
        err: err,
      });
    } else {
      res.send({
        code: 200,
        msg: "获取保修表数据成功",
        data: result,
      });
    }
  });
});

/**
 * @description: 添加报修信息
 * @param {}
 * @return {}
 */
router.post("/add_repair", (req, res) => {
  let { uid, name, account, address, content } = req.body;
  let sql =
    "INSERT INTO repair_manage(uid,name,account,address,content) VALUES(?,?,?,?,?)";
  client.query(sql, [uid, name, account, address, content], (err, result) => {
    if (err) {
      res.send({
        code: 201,
        msg: "添加报修信息失败",
        err: err,
      });
    } else {
      res.send({
        code: 200,
        msg: "添加报修信息成功",
      });
    }
  });
});

module.exports = router;
