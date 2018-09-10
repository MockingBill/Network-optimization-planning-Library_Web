/**
 *  Created with JetBrains WebStorm.
 *   User: fungdong
 *   Date: 2018/4/8
 *   Time: 上午10:41
 */



var express = require('express');
var router = express.Router();
var uuid = require('uuid');
var service = require('../service/requirementMan_service');
var utils = require('gmdp').init_gmdp.core_app_utils;
var app=require('../../../../app');


/**
 *
 * 显示全部弱覆盖需求路由
 */
router.post('/', function (req, res) {

    var params = req.body;
    service.getRequirementData(params, function (result) {

        utils.respJsonData(res, result);
    });

});


/**
 * 从弱覆盖信息中添加需求
 * 接收前台填写的参数，进行保存
 */
router.post('/addRequire', function (req, res) {


    var params = req.body;
    console.log(params);


    //  保存到数据库
    service.addRequirement(params, function ( result) {

        if (!result.success) {
            console.log('写入错误:' + result.reason);
            utils.respJsonData(res, result.reason);
        } else {

            for (var i in result) {
                console.log('00000000000000' + result[i]);
            }
            utils.respJsonData(res, result);
        }


    });


});


router.post('/update', function (req, res) {

    console.log('----'+JSON.stringify(req.body.netModel));

    // var ID = uuid.v4();

    var id = req.body.ID;
    var params = req.body;


    //  保存到数据库
    service.updateRequirementMan(id,params, function ( result) {


        if (!result.success) {

            utils.respJsonData(res, result);
        } else {

            utils.respJsonData(res, result);
        }


    });


});

/**
 *  删除如覆盖需求信息
 *  ID是所获取要删除的记录ID
 */
router.route('/delete').get(function (req, res) {

    var rows = req.query.rows;
    var ID = [];
    if (rows.length != 0 && rows.length != undefined && rows.length != null) {

        for (var i in rows) {
            ID.push(rows[i].ID);
        }
    }

    service.deleteRequirementData(ID, function (result) {

        utils.respJsonData(res, result);

    });


});

router.post('/isExists', function (req, res) {

    var ID = req.body.coll_ID;

    // console.log(ID)

    //  保存到数据库
    service.isExistsRequirement(ID, function ( result) {

        console.log(result);

        if (!result.success) {
            console.log('数据查询错误'+result.msg)
        } else {
            utils.respJsonData(res, result.data);
        }


    });


});


module.exports = router;