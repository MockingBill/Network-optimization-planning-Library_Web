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
                        var succ=0;
                        var fail=0;
                        for (var i = 0; i < result.length; i++) {
                            var params = [];
                            if (i > 0) {
                                params.push(uuid.v4());
                                if (result[i][0] !== '' && result[i][0] !== undefined) {
                                    params.push(result[i][0]);

                                } else {
                                    continue;
                                }
                                //预建站点名
                                if (result[i][17] !== '' && result[i][17] !== undefined) {
                                    params.push(result[i][17]);
                                } else {
                                    continue;
                                }
                                //网络制式
                                if (result[i][19] !== '' && result[i][19] !== undefined) {
                                    params.push(result[i][19]);
                                } else {
                                    continue;
                                }
                                //预建站点地址
                                if (result[i][18] !== '' && result[i][18] !== undefined) {
                                    params.push(result[i][18]);
                                } else {
                                    continue;
                                }
                                //站点属性（室分、宏站、小基站）
                                if (result[i][20] !== '' && result[i][20] !== undefined) {
                                    params.push(result[i][20]);
                                } else {
                                    continue;
                                }
                                //建设类型（共址、新建）
                                if (result[i][21] !== '' && result[i][21] !== undefined) {
                                    params.push(result[i][21]);
                                } else {
                                    continue;
                                }
                                //需求小区数
                                if (result[i][22] !== '' && result[i][22] !== undefined) {
                                    params.push(result[i][22]);
                                } else {
                                    continue;
                                }
                                //是否过联席会
                                if (result[i][23] !== '' && result[i][23] !== undefined) {
                                    params.push(result[i][23]);
                                } else {
                                    continue;
                                }
                                //负责人
                                if (result[i][24] !== '' && result[i][24] !== undefined) {
                                    params.push(result[i][24]);
                                } else {
                                    continue;
                                }
                                //电话
                                if (result[i][25] !== '' && result[i][25] !== undefined) {
                                    params.push(result[i][25]);
                                } else {
                                    continue;
                                }
                                //上报日期
                                if (result[i][26] !== '' && result[i][26] !== undefined) {
                                    params.push(result[i][26]);

                                } else {
                                    continue;
                                }
                                requirementService.addExcelRequirement(params, function (err,res1) {
                                    if(err){
                                        fail++;
                                    }else{
                                       succ++;
                                    }
                                    if((fail+succ)===(result.length-1)){
                                        utils.respJsonData(res, utils.returnMsg(true, '1000', '数据写入成功。成功:'+succ+'条'+'失败:'+fail+'条',null , null));

                                    }

                                });
                            }


                        }
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
                            var showErrString = '';
                            for (var i in result) {
                                //排除Excel内容标题（Excel第一行）
                                if (i > 0) {
                                    //添加时间（采集时间）
                                    count++;
                                    //全部覆盖数据保存到数据库，并记录来自数据导入
                                    insertService.insertNetCellDataForInput(loginName, result[i], function (err,res1) {
                                        if(err){
                                            fail++;
                                            // result[i].push(count);

                                            for(var  j in result[i]){
                                                showErrString =  showErrString+ result[i][j] ;
                                            }
                                            showErrString = showErrString+'\n'
                                            // failError.push( + '\n');


                                        }else{
                                            succ++;
                                            // result[i].push(count);
                                            // failError.push(result[i]);
                                        }

                                        if((fail+succ)===(result.length-1)){
                                            utils.respJsonData(res, utils.returnMsg(true, '1000', {data:'数据写入成功。成功:'+succ+'条'+'失败:'+fail+'条',str:showErrString},null , null));

                                        }
                                    });
                                }
                            }
                        }

                        // utils.respJsonData(res, utils.returnMsg(true, '1000', '上传文件成功。', result.length, null));

                    }
                });
                // res.send('导入连接成功');
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


