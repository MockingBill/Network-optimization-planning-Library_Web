/**
 * Created by fungdong on 2018-03-27
 */

var app=require('../../../../app');
var mysql = require('mysql');
var async=require('async');
var pool = mysql.createPool({
    // host     : 'mysqlIP',
    host     : '127.0.0.1',
    port     : '3306',
    user     : 'root',
    password : '198226198484dq',
    database : 'netcell'

});





exports.query = function (sql,value,callback){

    if (!sql) {
        app.logger.info("sql数据错误或者未找到sql语句:\n");
        callback();
        return;
    }
    pool.query(sql, value, function(err,rows,fields){
        if (err) {
            app.logger.info("数据库操作失败:\n"+err);
            callback(err, null);
            return;
        }
        else{
            var result = [];
            for(var i in rows){
                result.push(rows[i]);
            }
            callback(null, rows, fields);
            // pool.release();
        }

    });
};


exports.execTrans= function (sqlparamsEntities, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            return callback(err, null);
        }
        connection.beginTransaction(function (err) {
            if (err) {
                return callback(err, null);
            }
            console.log("开始执行transaction，共执行" + sqlparamsEntities.length + "条数据");
            var funcAry = [];
            sqlparamsEntities.forEach(function (sql_param) {
                var temp = function (cb) {
                    var sql = sql_param.sql;
                    var param = sql_param.params;
                    connection.query(sql, param, function (tErr, rows, fields) {
                        if (tErr) {
                            connection.rollback(function () {
                                console.log("事务失败，" + sql_param + "，ERROR：" + tErr);
                                throw tErr;
                            });
                        } else {
                            return cb(null, 'ok');
                        }
                    })
                };
                funcAry.push(temp);
            });

            async.series(funcAry, function (err, result) {
                console.log("transaction error: " + err);
                if (err) {
                    connection.rollback(function (err) {
                        console.log("transaction error: " + err);
                        connection.release();
                        return callback(err, null);
                    });
                } else {
                    connection.commit(function (err, info) {
                        console.log("transaction info: " + JSON.stringify(info));
                        if (err) {
                            console.log("执行事务失败，" + err);
                            connection.rollback(function (err) {
                                console.log("transaction error: " + err);
                                connection.release();
                                return callback(err, null);
                            });
                        } else {
                            connection.release();
                            return callback(null, info);
                        }
                    })
                }
            })
        });
    });
};

exports.getNewSqlParamEntity=function (sql, params, callback) {
    if (callback) {
        return callback(null, {
            sql: sql,
            params: params
        });
    }
    return {
        sql: sql,
        params: params
    };
}


