/**
 *  Created with JetBrains WebStorm.
 *   User: fungdong
 *   Date: 2018/3/28
 *   Time: 下午2:40
 */


var underscore = require('underscore');
var xlsx = require('node-xlsx');
var fs = require('fs');
var path = require('path');
var config = require('../../../../config');
var app=require('../../../../app');


/**
 * 用于生成excel文件
 * @param headArr excel表头
 * @param body    导出的内容
 * @param filePath  导出到哪里的地址
 * @param callback  回调方法，导出成功后返回'完成'，失败返回错误信息
 */
exports.createExcel = function (headArr, body, filePath, callback) {
    try{
       var data = [];
       data.push(headArr);
       for (var i in body) {
           var bb = [];
           for (var j in body[i]) {
               bb.push(body[i][j]);
           }

           data.push(bb);
       }

       var data1 = [
           {
               name: '弱覆盖统计',
               data: data
           }
       ];

       var buffer = xlsx.build(data1);

       fs.writeFile(filePath, buffer, function (err) {
               if (err) {
                   app.logger.info("数据写入文件失败:\n"+err);
                   callback(err, false);
               }else{
                   callback(null, true);
               }

           }
       );
   }catch(err){
        app.logger.info("excel文件生成失败:\n"+err);
        callback(err, false);
   }


};


/**
 * 用于获取文件以获得文件内容
 * @param file 导入文件和地址
 * @param callback 回调方法，导入成功后放回'导入成功'，失败返回错误信息
 */
exports.importExcel = function (file, callback) {

    try {
        file = path.join(config.project.home, 'public/static/file/importExcel/' + file);
        var data = [];
        var obj = xlsx.parse(file);
        data = obj[0].data;
        // console.log('1111111'+data);
        callback(false, data);
    } catch (e) {
        app.logger.info("文件读取失败:\n"+e);
        callback(e, data);
    }


};


/**
 *  导入弱覆盖需求信息，根据模板导入数据
 *  未使用
 * @param file 导入文件
 * @param callback 回调方法，导入成功后返回'成功'，失败返回错误信息
 */
/*exports.importRequirementExcel = function (file, callback) {

    file = '/Users/fungdong/Downloads/弱覆盖信息导出文件3522.xlsx';

    var data = [];
    var err = null;
    try {

        var obj = xlsx.parse(file);
        data = obj[0].data;

    } catch (e) {
        err = '解析出错' + e.toString();
    }

    callback(err, data);
};*/

