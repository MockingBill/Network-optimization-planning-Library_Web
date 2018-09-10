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
    service.get2GDataForm4G(params ,function (result) {

        console.log(result.data);
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

router.route('/errUpload').post(function (req,res) {
    var errData=req.body;
    var flag=true;

    for(var i in errData){
       var currentData=[
           errData[i].address,
           errData[i].bsss,
           errData[i].city,
           errData[i].collStatus,
           errData[i].collTime,
           errData[i].eci,
           errData[i].localX,
           errData[i].localY,
           errData[i].num,
           errData[i].oper,
           errData[i].phoneNumber,
           errData[i].phoneStatus,
           errData[i].firstScene,
           errData[i].secondScene,
           errData[i].tac,
           errData[i].zone]
        for(var j in currentData){
           if(currentData[j]==undefined||currentData[j]==null||currentData[j]==''){
               flag=false;
               break;
           }
        }

    }




    if(flag){
        service.SaveWeekData(errData,req.session.current_user.login_account,function (result,msg) {
            utils.respJsonData(res,utils.returnMsg(true, '1000', '插入成功。', msg, null));
        });

    }
    else{
        utils.respJsonData(res, utils.returnMsg(false, '1000', '请保证上传数据完整性～', "请保证上传数据完整性～", null));
    }

});



module.exports = router;


