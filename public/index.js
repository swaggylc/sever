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

// 手机验证码
let phoneCode;

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
          address: result[0].address,
          sex: result[0].sex
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

// 下面是echarts图表的一些接口
/**
 * @description: 返回男女用户个数
 * @param {}
 * @return {}
 */
router.get("/sex_ratio", (req, res) => {
  let sql = "SELECT COUNT(sex) AS sex_count,sex FROM user GROUP BY sex";
  client.query(sql, (err, result) => {
    if (err) {
      res.send({
        code: 201,
        msg: "获取男女用户个数失败",
        err: err,
      });
    } else {
      res.send({
        code: 200,
        msg: "获取男女用户个数成功",
        data: result,
      });
    }
  });
});

// 下面是报修表的一些接口
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
        msg: "获取报修表数据失败",
        err: err,
      });
    } else {
      // 找到type
      result.forEach((item) => {
        item.rate = Number(item.rate);
        if (item.type == 1) {
          item.type = "小区卫生";
        } else if (item.type == 2) {
          item.type = "花坛绿化";
        } else if (item.type == 3) {
          item.type = "管道堵塞";
        } else if (item.type == 4) {
          item.type = "公共水电";
        } else if (item.type == 5) {
          item.type = "楼道电梯";
        } else if (item.type == 6) {
          item.type = "其他";
        }
      });
      res.send({
        code: 200,
        msg: "获取保修表数据成功",
        data: result,
      });
    }
  });
});

/**
 * @description: 根据uid获取报修信息
 * @param {}
 * @return {}
 */
router.get("/repair_list/:uid", (req, res) => {
  let { uid } = req.params;
  let sql = "SELECT * FROM repair_manage WHERE uid = ?";
  client.query(sql, [uid], (err, result) => {
    if (err) {
      res.send({
        code: 201,
        msg: "获取报修信息失败",
        err: err,
      });
    } else {
      res.send({
        code: 200,
        msg: "获取报修信息成功",
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
  let { uid, name, account, address, content, createTime, type } = req.body;
  let sql =
    "INSERT INTO repair_manage(uid,name,account,address,content,create_time,type) VALUES(?,?,?,?,?,?,?)";
  client.query(
    sql,
    [uid, name, account, address, content, createTime, type],
    (err, result) => {
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
    }
  );
});

/**
 * @description: 更改报修状态的接口
 * @param {}
 * @return {}
 */
router.post("/change_repair_status", (req, res) => {
  let { repairNumber, status } = req.body;
  let sql = "UPDATE repair_manage SET status = ? WHERE repair_number = ?";
  client.query(sql, [status, repairNumber], (err, result) => {
    if (err) {
      res.send({
        code: 201,
        msg: "更改报修状态失败",
        err: err,
      });
    } else {
      res.send({
        code: 200,
        msg: "更改报修状态成功",
      });
    }
  });
});

/**
 * @description: 报修条件查询接口
 * @param {}
 * @return {}
 */
router.post("/repair_list/condition", (req, res) => {
  let { type, status, repair_number } = req.body;
  // 拼接查询条件
  let sql = "SELECT * FROM repair_manage WHERE 1=1";
  let params = [];
  if (type) {
    sql += " AND type = ?";
    params.push(type);
  }
  if (status === 0 || status === 1 || status === 2) {
    sql += " AND status = ?";
    params.push(status);
  }
  if (repair_number) {
    sql += " AND repair_number = ?";
    params.push(repair_number);
  }
  client.query(sql, params, (err, result) => {
    if (err) {
      res.send({
        code: 201,
        msg: "查询失败",
      });
    }
    if (result.length > 0) {
      result.forEach((item) => {
        item.rate = Number(item.rate);
        if (item.type == 1) {
          item.type = "小区卫生";
        } else if (item.type == 2) {
          item.type = "花坛绿化";
        } else if (item.type == 3) {
          item.type = "管道堵塞";
        } else if (item.type == 4) {
          item.type = "公共水电";
        } else if (item.type == 5) {
          item.type = "楼道电梯";
        } else if (item.type == 6) {
          item.type = "其他";
        }
      });
      res.send({
        code: 200,
        msg: "查询成功",
        data: result,
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
 * @description: 评价接口
 * @param {}
 * @return {}
 */
router.post("/appraise", (req, res) => {
  let { repairNumber, appraise, rate } = req.body;
  if (appraise == "") {
    appraise = "该用户未填写评价，默认好评";
  }
  let sql =
    "UPDATE repair_manage SET appraise = ?,rate=?,appraise_status = 1 WHERE repair_number = ?";
  client.query(sql, [appraise, rate, repairNumber], (err, result) => {
    if (err) {
      res.send({
        code: 201,
        msg: "评价失败",
        err: err,
      });
    } else {
      res.send({
        code: 200,
        msg: "评价成功",
      });
    }
  });
});
// 访客登记表相关
/**
 * @description: 查询所有访客记录
 * @param {}
 * @return {}
 */
router.get("/get_visitor_list", (req, res) => {
  let sql = "SELECT * FROM visitor_log";
  client.query(sql, (err, result) => {
    if (err) {
      res.send({
        code: 201,
        msg: "查询失败",
        err: err,
      });
    } else {
      res.send({
        code: 200,
        msg: "查询成功",
        data: result,
      });
    }
  });
});

/**
 * @description: 添加一条访客记录
 * @param {}
 * @return {}
 */
router.post("/add_visitor_check", (req, res) => {
  let {
    name,
    telNumber,
    enterTime,
    content,
    visitorNumber,
    address,
    manager,
    other,
  } = req.body;
  let sql =
    "INSERT INTO visitor_log(name,tel_number,enter_time,content,visitor_number,address,manager,other) VALUES(?,?,?,?,?,?,?,?)";
  client.query(
    sql,
    [
      name,
      telNumber,
      enterTime,
      content,
      visitorNumber,
      address,
      manager,
      other,
    ],
    (err, result) => {
      if (err) {
        res.send({
          code: 201,
          msg: "添加失败",
          err: err,
        });
      } else {
        res.send({
          code: 200,
          msg: "添加成功",
        });
      }
    }
  );
});

/**
 * @description: 修改访客记录
 * @param {}
 * @return {}
 */
router.post("/update_visitor", (req, res) => {
  let { logId, outTime, noOutResult, other } = req.body;
  // 如果没有填写离开时间，则离开状态还是2，不用修改
  if (outTime == null) {
    let sql =
      "UPDATE visitor_log SET out_time = ?,no_out_result = ?,other = ? WHERE log_id = ?";
    client.query(sql, [outTime, noOutResult, other, logId], (err, result) => {
      if (err) {
        res.send({
          code: 201,
          msg: "修改失败",
          err: err,
        });
      } else {
        res.send({
          code: 200,
          msg: "修改成功",
        });
      }
    });
  }
  // 如果填写了离开时间，则离开状态为1
  if (outTime != null) {
    let sql =
      "UPDATE visitor_log SET out_time = ?,no_out_result = ?,other = ?,out_status=? WHERE log_id = ?";
    client.query(
      sql,
      [outTime, noOutResult, other, 1, logId],
      (err, result) => {
        if (err) {
          res.send({
            code: 201,
            msg: "修改失败",
            err: err,
          });
        } else {
          res.send({
            code: 200,
            msg: "修改成功",
          });
        }
      }
    );
  }
});

/**
 * @description: 访客记录删除接口
 * @param {}
 * @return {}
 */
router.post("/delete_visitor", (req, res) => {
  let { logId, account, reqCode } = req.body;
  const deleteHandler = (logId) => {
    let sql = "DELETE FROM visitor_log WHERE log_id = ?";
    client.query(sql, [logId], (err, result) => {
      if (err) {
        res.send({
          code: 201,
          msg: "删除失败",
          err: err,
        });
      } else {
        res.send({
          code: 200,
          msg: "删除成功",
        });
      }
    });
  };
  if (account == "15180595913") {
    // 直接删除
    deleteHandler(logId);
  } else {
    // 对比验证码
    if (reqCode == phoneCode) {
      // 直接删除
      deleteHandler(logId);
    } else {
      res.send({
        code: 201,
        msg: "验证码错误",
      });
    }
  }
});

/**
 * @description: 获取验证码接口
 * @param {}
 * @return {}
 */
router.get("/get_code", (req, res) => {
  // 生成随机6位数验证码
  let code = Math.random().toString().slice(-6);
  phoneCode = code;
  res.send({
    code: 200,
    msg: "获取验证码成功",
    data: code,
  });
});

/**
 * @description: 搜索访客的接口
 * @param {}
 * @return {}
 */
router.post("/search_visitor", (req, res) => {
  let { name, manager, status } = req.body;
  let sql = "SELECT * FROM visitor_log WHERE 1=1";
  let params = [];
  if (name) {
    sql += " AND name = ?";
    params.push(name);
  }
  if (manager) {
    sql += " AND manager = ?";
    params.push(manager);
  }
  if (status === "1" || status === "2") {
    sql += " AND out_status = ?";
    params.push(status);
  }
  client.query(sql, params, (err, result) => {
    if (err) {
      res.send({
        code: 201,
        msg: "查询失败",
        err: err,
      });
    } else {
      res.send({
        code: 200,
        msg: "查询成功",
        data: result,
      });
    }
  });
});

// 投诉管理相关接口
/**
 * @description: 获取所有投诉信息
 * @param {}
 * @return {}
 */
router.get("/get_complain_list", (req, res) => {
  let sql = "SELECT * FROM complain_manage";
  client.query(sql, (err, result) => {
    if (err) {
      res.send({
        code: 201,
        msg: "查询失败",
        err: err,
      });
    } else {
      res.send({
        code: 200,
        msg: "查询成功",
        data: result,
      });
    }
  });
});

/**
 * @description: 用户新增投诉
 * @param {}
 * @return {}
 */
router.post("/add_complain", (req, res) => {
  let { name, account, manager, content, complainTime, other } = req.body;
  let sql =
    "INSERT INTO complain_manage(name,account,manager,content,complain_time,other) VALUES(?,?,?,?,?,?)";
  client.query(
    sql,
    [name, account, manager, content, complainTime, other],
    (err, result) => {
      if (err) {
        res.send({
          code: 201,
          msg: "添加投诉失败",
          err: err,
        });
      } else {
        //查询manager_user表，找到对应的管理员
        let sql = "SELECT * FROM manager_user WHERE uid = ?";
        client.query(sql, [manager], (err, result) => {
          // 一定能查询到
          let managerName = result[0].name;
          // 将这个名字更新到投诉表中
          let sql =
            "UPDATE complain_manage SET manager_name = ? WHERE manager = ?";
          client.query(sql, [managerName, manager], (err, result) => {
            // 这个也一定能更新成功
            res.send({
              code: 200,
              msg: "添加投诉成功",
            });
          });
        });
      }
    }
  );
});

/**
 * @description: 根据联系方式查询投诉信息(用户使用)
 * @param {}
 * @return {}
 */
router.get("/my_complain/:account", (req, res) => {
  let { account } = req.params;
  let sql = "SELECT * FROM complain_manage WHERE account = ?";
  client.query(sql, [account], (err, result) => {
    if (err) {
      res.send({
        code: 201,
        msg: "获取投诉信息失败",
        err: err,
      });
    } else {
      res.send({
        code: 200,
        msg: "获取投诉信息成功",
        data: result,
      });
    }
  });
});

/**
 * @description: 根据id删除某条投诉信息
 * @param {}
 * @return {}
 */
router.post("/delete_complain", (req, res) => {
  let { id } = req.body;
  let sql = "DELETE FROM complain_manage WHERE id = ?";
  client.query(sql, [id], (err, result) => {
    if (err) {
      res.send({
        code: 201,
        msg: "删除失败",
        err: err,
      });
    } else {
      res.send({
        code: 200,
        msg: "删除成功",
      });
    }
  });
});

/**
 * @description: 更新投诉信息是否首次投诉状态
 * @param {}
 * @return {}
 */
router.post("/update_complain_status", (req, res) => {
  let { id } = req.body;
  // 同时也要把状态改为未跟进
  let sql =
    "UPDATE complain_manage SET repeat_status = 2,status=1 WHERE id = ?";
  client.query(sql, [id], (err, result) => {
    if (err) {
      res.send({
        code: 201,
        msg: "更新失败",
        err: err,
      });
    } else {
      res.send({
        code: 200,
        msg: "更新成功",
      });
    }
  });
});

/**
 * @description: 更新投诉信息
 * @param {}
 * @return {}
 */
router.post("/update_complain", (req, res) => {
  let { id, level, status, result } = req.body;
  let sql =
    "UPDATE complain_manage SET level = ?, status = ?,result=? WHERE id = ?";
  client.query(sql, [level, status, result, id], (err, result) => {
    if (err) {
      res.send({
        code: 201,
        msg: "更新失败",
        err: err,
      });
    } else {
      res.send({
        code: 200,
        msg: "更新成功",
      });
    }
  });
});

// 账号设置
/**
 * @description: 更新用户账号信息
 * @param {}
 * @return {}
 */
router.post("/account_setting", (req, res) => {
  let { type } = req.body;
  let sql = "";
  // 用户
  if (type == 0) {
    let { account, password, username, name, address, sex, uid } = req.body;
    let arrayParams = [account, password, username, name, address, sex, uid];
    sql =
      "UPDATE user SET account = ?, password = ?,username=?,name=?,address=?,sex=? WHERE uid = ?";
    accountSet(sql, arrayParams);
  } else if (type == 1) {
    let { account, password, username, name, uid } = req.body;
    let arrayParams = [account, password, username, name, uid];
    sql =
      "UPDATE manager_user SET account = ?, password = ?,username=?,name=? WHERE uid = ?";
    accountSet(sql, arrayParams);
  }

  const accountSet = (sql, arrayParams) => {
    client.query(sql, arrayParams, (err, result) => {
      if (err) {
        res.send({
          code: 201,
          msg: "更新失败",
          err: err,
        });
      } else {
        res.send({
          code: 200,
          msg: "更新成功",
        });
      }
    });
  };
});

module.exports = router;
