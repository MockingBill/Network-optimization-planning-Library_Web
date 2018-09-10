/**
 * Created by fungdong on 2018-03-27
 */

var app=require('../../../../app');
var mysql = require('mysql');
var pool = mysql.createPool({
    // host     : 'mysqlIP',
    host     : '127.0.0.1',
    port     : '3306',
    user     : 'root',
    //password : '12345687',
    password : '198226198484dq',
    database : 'network_planning_library_db'

});


var db  = {};


db.query = function (sql,value,callback){

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
module.exports = db;
