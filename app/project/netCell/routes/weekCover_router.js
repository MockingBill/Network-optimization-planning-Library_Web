/**
 *  Created with JetBrains WebStorm.
 *   User: fungdong
 *   Date: 2018/3/27
 *   Time: 下午3:40
 */



var express = require('express');
var router = express.Router();
var service = require('../service/weekCover_service');
var utils = require('gmdp').init_gmdp.core_app_utils;
var app=require('../../../../app');


/**
 * 获取弱覆盖信息，其值为信号强度低于 -110的值
 */
router.route('/').post(function (req, res) {

    var params = req.body;
    if(params.BSSSfor2G ==='' || params.BSSSfor2G ===null ||params.BSSSfor2G ===undefined){
        service.getWeekCoverData(params ,function (result) {

            utils.respJsonData(res, result);
        });
    }else {

        service.getWeekCover2GData(params ,function (result) {

            utils.respJsonData(res, result);
        });
    }



});

//获取相同地点的2G/4G数据
router.route('/checkSameLoca').post(function (req, res) {

    var params = req.body;
    // console.log('---------------'+params.BSSS);
    service.get2GDataForm4G(params ,function (result) {
        // for(var i in result){
        //     console.log(result[i])
        // }

        console.log(result.data)
        utils.respJsonData(res, result);
    });

});

/**
 * 修改弱覆盖解决状态
 */
router.route('/updateStatus').get(function (req, res) {

    var params = req.query;
    // console.log(params);
    service.updateWeekStatus(params ,function (result) {

        utils.respJsonData(res, result);
    });

});



module.exports = router;


