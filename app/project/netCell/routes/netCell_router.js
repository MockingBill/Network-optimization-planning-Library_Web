/**
 *  Created with JetBrains WebStorm.
 *   User: fungdong
 *   Date: 2018/4/2
 *   Time: 下午1:49
 */


var express = require('express');
var router = express.Router();
var service=require('../service/netCell_service.js');
var uuid = require('uuid');
var utils = require('gmdp').init_gmdp.core_app_utils;
var app=require('../../../../app');



/**
 *  根据查询条件查询所有覆盖的数据
 *  params 是所有查询条件
 */
router.route('/getAllCover').post(function (req, res ) {
    var params = req.body;
    service.getNetCellData(params,function (result) {
        utils.respJsonData(res, result);
    });


});

/**
 * 根据查询条件查询所有覆盖数据统计
 *  params 是所有查询条件
 */
router.route('/checkAll').post(function (req, res ) {

    var params = req.body;
    // res.send('aaaaa');
     service.getCheckAll(params,function (result) {
         utils.respJsonData(res, result);
     });


});

/**
 * 根据查询条件查询所有弱覆盖数据统计
 *  params 是所有查询条件
 */
router.route('/checkWeek').post(function (req, res ) {
    var params = req.body;
    service.getCheckWeek(params,function (result) {
        utils.respJsonData(res, result);
    });

});


/**
 *  手动添加一条弱覆盖信息
 *  params 是要添加的弱覆盖数据
 */
router.route('/insert').post(function (req,res) {
    var  params = [];
    params.push(uuid.v1());
    params.push(req.body.ECI);
    params.push(req.body.TAC);
    params.push(parseInt(req.body.BSSS));
    params.push(req.body.GPS);
    params.push(req.body.phoneNumber);
    params.push(req.body.phoneType);
    params.push(req.body.overlayScene);
    params.push(req.body.district);
    params.push(req.body.address);
    params.push(req.body.NetworkOperatorName);
    params.push(req.body.city);
    params.push(req.body.collTime);
    params.push(req.body.solveStatus);
    params.push(req.body.solveTime);
    var loginName = req.session.current_user.login_account;
    service.insertNetCellData(loginName,params,function (result) {
        utils.respJsonData(res, result);
    });


});

/**
 *  删除指定的弱覆盖数据
 *  如果是多条，获取要删除的弱覆盖数据ID
 */
router.route('/delete').get(function (req,res) {
    var rows = req.query.rows;
    var ID = [];
    if(rows.length!=0 && rows.length!=undefined && rows.length!=null){
        for(var i in rows){
            ID.push(rows[i].ID);
        }
    }
    service.deleteWeekData(ID,function (result) {
        utils.respJsonData(res, result);
    });
});



module.exports = router;


