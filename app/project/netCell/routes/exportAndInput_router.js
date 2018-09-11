/**
 *  Created with JetBrains WebStorm.
 *   User: fungdong
 *   Date: 2018/3/27
 *   Time: 下午3:40
 */


var express = require('express');
var config=require('../../../../config');
var router = express.Router();
var service = require('../service/weekCover_service');
var insertService = require('../service/netCell_service');
var requirementService = require('../service/requirementMan_service');
var excelService = require('../model/execlExport.js');

var uuid = require('uuid');

var utils = require('gmdp').init_gmdp.core_app_utils;
var fs = require('fs');
var app=require('../../../../app');
var path=require('path');
/**
 *  检查Excel上传文件
 */
var dirPath = config.project.home+"/public/static/file/importExcel/";


/**
 * 获取所有覆盖导出信息
 *
 */
router.get('/exportAllCoverExcel', function (req, res) {

    //获取查询参数
    var params = req.query.rows;
    params['user_account']=req.session.current_user.login_account;

    service.getAllCoverExcelData(params, function (result) {
        utils.respJsonData(res, result);
    });


});


/**
 * 导出选择的弱覆盖信息到Excel
 */
router.get('/exportExcel', function (req, res) {

    //获取查询参数
    var params = req.query.rows;
    params['user_account']=req.session.current_user.login_account;

    service.getWeekExcelData(params, function (result) {
        utils.respJsonData(res, result);
    });


});





/**
 *  导出弱覆盖需求到Excel（弱覆盖需求信息）
 */
router.get('/exportRequirementExcel', function (req, res) {

    //获取需要导出的数据
    var params = req.query.rows;
    params['user_account']=req.session.current_user.login_account;

    requirementService.getRequirementExcelData(params, function (result) {
        utils.respJsonData(res, result);
    });


});


/**
 *  导入弱覆盖需求Excel（弱覆盖需求）
 */
router.route('/importRequirementFile').post(function (req, res) {

    //获取文件信息
    var file = req.files.inportWeekFile;
    var newFile = file.originalname;
    var loginName = req.session.current_user.login_account;
    //可以不上传文件、当无法检测文件的时候直接返回相关信息
    if (file === null || file === undefined || file === '') {
        utils.respJsonData(res, utils.returnMsg(false, '0000', '未检测到有文件上传。', null, null));
    }
    //只能上传压缩、文档、工作表类型的文件
    else if (file.extension === 'xls' || file.extension === 'xlsx') {
        //文件最大限制在 20 MB
        if ((file.size / 1024) <= 20480) {
            if (file.originalname !== null && file.originalname !== '' && file.originalname !== undefined) {
                //读取excel文件数据
                excelService.importExcel(newFile, function (err, result) {
                    if (err) {
                        app.logger.info("文件读取出错:"+err);
                        utils.respJsonData(res, utils.returnMsg(false, '0000', '写入数据出错。', null, null));
                    } else {
                        var loginName = req.session.current_user.login_account;
                        requirementService.addExcelRequirement(result,loginName,function (execResu) {
                            utils.respJsonData(res,execResu);
                        });
                    }
                });
            } else {
                //上传出现异常的异常处理是若存在文件则删除、返回异常信息
                if (fs.existsSync(dirPath + file.name)) {
                    utils.respJsonData(res, utils.returnMsg(false, '0000', '上传文件异常。', null, null));
                }

            }
        } else {
            if (fs.existsSync(dirPath + file.name))
                utils.respJsonData(res, utils.returnMsg(false, '0000', '文件过大。', null, null));
        }
    } else {
        if (fs.existsSync(dirPath + file.name))
            utils.respJsonData(res, utils.returnMsg(false, '0000', '文件类型错误。', null, null));
    }


});




/**
 *  导入弱覆盖信息Excel
 */

router.route('/upload').post(function (req, res) {
    //获取上传的文件相关内容
    var file = req.files.inportWeekFile;
    //获取文件名
    var newFile = file.originalname;
    var loginName = req.session.current_user.login_account;
    //可以不上传文件、当无法检测文件的时候直接返回相关信息
    if (file === null || file === undefined || file === '') {
        utils.respJsonData(res, utils.returnMsg(true, '0000', '未检测到有文件上传。', null, null));
    }
    //只能上传压缩、文档、工作表类型的文件
    else if (file.extension === 'xls' || file.extension === 'xlsx') {
        //文件最大限制在 20 MB

        if ((file.size / 1024) <= 30720) {

            if (file.originalname !== null && file.originalname !== '' && file.originalname !== undefined) {
                //读取上传Excel文件内容
                excelService.importExcel(newFile, function (err, result) {
                    if (err) {
                        console.log(err);
                        utils.respJsonData(res, utils.returnMsg(false, '0000', '写入数据出错。', null, null));

                    } else {
                        if (result != undefined) {
                            var succ = 0;
                            var fail = 0;
                            var failError = [];
                            var count=0;
                            for (var i in result) {

                                //排除Excel内容标题（Excel第一行）
                                if (i > 0) {
                                    count++;
                                    //添加时间（采集时间）
                                    //全部覆盖数据保存到数据库，并记录来自数据导入
                                    var obj={
                                        "num":count,
                                        "city":result[i][0],
                                        "zone":result[i][1],
                                        "address":result[i][2],
                                        "firstScene":result[i][3],
                                        "secondScene":result[i][4],
                                        "localX":result[i][5],
                                        "localY":result[i][6],
                                        "eci":result[i][7],
                                        "tac":result[i][8],
                                        "bsss":result[i][9],
                                        "collName":result[i][10],
                                        "collPhoneNumber":result[i][11],
                                        "collDempart":result[i][12],
                                        "oper":result[i][13],
                                        "nettype":result[i][14],
                                        "phoneStatus":result[i][15],
                                        "collTime":result[i][16],
                                        "collStatus":result[i][17],
                                        "solveTime":result[i][18],
                                        "err":""
                                    };

                                    insertService.insertNetCellDataForInput(loginName, result[i], function (err,res1) {
                                        if(err){
                                            obj['err']=err.sqlMessage;
                                            fail++;
                                            failError.push(obj);
                                        }else{
                                            succ++;
                                        }
                                        if((fail+succ)===(result.length-1)){
                                            utils.respJsonData(res, utils.returnMsg(true, '1000','数据写入成功。成功:'+succ+'条'+'失败:'+fail+'条',failError,null));
                                        }
                                    });
                                }
                            }
                        }

                    }
                });

            } else {
                //上传出现异常的异常处理是若存在文件则删除、返回异常信息
                if (fs.existsSync(dirPath + file.name)) {
                    deleteall(dirPath + file.name);
                }
                utils.respJsonData(res, utils.returnMsg(false, '0000', '上传文件异常。', null, null));


            }
        } else {
            if (fs.existsSync(dirPath + file.name)){
                deleteall(dirPath + file.name);
            }
                utils.respJsonData(res, utils.returnMsg(false, '0000', '文件过大。', null, null));
        }
    } else {
        if (fs.existsSync(dirPath + file.name)){
            deleteall(dirPath + file.name);
        }
            utils.respJsonData(res, utils.returnMsg(false, '0000', '文件类型错误。', null, null));
    }
});







function deleteall (url) {
    fs.unlinkSync(url);
};


module.exports = router;


