const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const app = express();

// 引入公共接口
const public = require("./public/index.js");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  // 设置响应头
  // 若设置指定值，则只能设置一个域名
  res.setHeader("Access-Control-Allow-Origin", "*");
  // 设置允许请求的方式
  res.setHeader("Access-Control-Allow-Methods", "*");
  // 设置允许携带的请求头
  res.setHeader("Access-Control-Allow-Headers", "*");
  // 设置响应头
  res.setHeader("Content-Type", "application/json;charset=utf-8");
  // 放行
  next();
});

// 设置跨域
app.use(cors());

// token验证中间件
app.use(
  expressJwt
    .expressjwt({
      // 解析口令, 需要和加密的时候一致
      secret: "lucan0417",
      // 加密方式: SHA256 加密方式在 express-jwt 里面叫做 HS256
      algorithms: ["HS256"],
    })
    .unless({
      // 不需要验证 token 的路径标识符
      path: ["/public/login"],
    })
);

// 注册公共接口
app.use("/public", public);

// 错误处理中间件
app.use((err, req, res, next) => {
  res.send({ err });
});

app.listen(3000, () => {
  console.log(
    "Server is running on port 3000" + "\n" + "http://localhost:3000/"
  );
});
