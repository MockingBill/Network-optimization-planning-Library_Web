/**
 *  Created with JetBrains WebStorm.
 *   User: fungdong
 *   Date: 2018/4/3
 *   Time: 下午09:42
 */

var utils = require('gmdp').init_gmdp.core_app_utils;
var model = require('../model/mysqlModel');
var excelService = require('../model/execlExport.js');
var app=require('../../../../app');
var config=require('../../../../config');
var uuid = require('node-uuid');
var sd = require('silly-datetime');



/**
 * 根据条件   获取导出覆盖信息数据
 * @param params 查询条件
 * @param cb 回调方法，成功后返回数据以供生成excel
 */
exports.getAllCoverExcelData = function (params, cb) {
    //编辑查询条件
    var queryDateStart = params.queryDateStart;
    var queryDateEnd = params.queryDateEnd;
    var city = params.city;
    var firstScene = params.firstScene;
    var secondScene = params.secondScene;
    //判断查询条件
    if (city === '全部' || city === undefined || city === '请选择地市') {
        city = '';
    }
    if (firstScene === '全部' || firstScene === undefined || firstScene === '请选择场景') {
        firstScene = '';
    }
    if (secondScene === '全部' || secondScene === undefined || secondScene === '请选择场景') {
        secondScene = '';
    }

    //合成场景查询条件
    var overlayScene = firstScene + '_' + secondScene;


    var sql1 = "select  city, \n" +
        "        district, \n" +
        "        address, \n" +
        "        SUBSTRING_INDEX(overlayScene,'_', 1) as overlayScene1,\n" +
        "        SUBSTRING_INDEX(overlayScene,'_', -1) as overlayScene2,\n" +
        "        GpsLon  as longitude, \n" +
        "        Gpslat as  asdimension, \n" +
        "        TAC, \n" +
        "        ECI, \n" +
        "        BSSS, \n" +
        "        collectUsername, \n" +
        "        phoneNumber, \n" +
        "        FromDepartment, \n" +
        "        phoneType, \n" +
        "        NetworkOperatorName, \n" +
        "        netWorkType, \n" +
        "        phoneType, \n" +
        "        collTime, \n" +
        "        solveStatus, \n" +
        "        solveTime, \n" +
        "        preStName, \n" +
        "        stAddress, \n" +
        "        netModel, \n" +
        "        stPrope, \n" +
        "        buildType, \n" +
        "        reqCellNum, \n" +
        "        isPass, \n" +
        "        personCharge, \n" +
        "        personTel, \n" +
        "        bu_weak_confirmation.reportTime, \n" +
        "        im_remark, \n" +
        "        confirm_eci, \n" +
        "        confirm_tac, \n" +
        "        confirm_bsss, \n" +
        "        confirm_networktype, \n" +
        "        confirm_lon, \n" +
        "        confirm_lat \n" +
        "        FROM (bu_collect_info left JOIN bu_weak_confirmation \n" +
        "        on bu_collect_info.ID=bu_weak_confirmation.coll_id) \n" +
        "        LEFT JOIN bu_weak_coverage_demand  \n" +
        "        on bu_weak_confirmation.demand_id=bu_weak_coverage_demand.ID"+

        ' where district like ' + '"%' + city + '%"' +
        ' and overlayScene like ' + '"%' + overlayScene + '%"' +
        ' and collTime between ' + '"' + queryDateStart + '"' + ' and ' + '"' + queryDateEnd + ' 23:59:59"' +
        ' and deleteFlag="0" ' +
        'order by collTime desc'
    ;




    console.log('查询条件：'+sql1);
    //查询并加工数据，完成后返回到前台
    model.query(sql1, [], function (err, row) {
        if (err) {
            app.logger.info("获取弱覆盖记录用于导出失败:\n" + err);
            cb(utils.returnMsg(false, '0000', '获取数据失败', null, err));
        }
        else {

            var result = [];

            for (var i in row) {
                result.push(row[i]);
            }

                //设置导出excel头
            var header = [
                '城市',
                '区县',
                '详细地址',
                '第一覆盖场景',
                '第二覆盖场景',
                '经度',
                '纬度',
                'TAC',
                'ECI',
                '信号强度',
                '采集人员',
                '采集人员手机号',
                '采集人员部门',
                '手机型号',
                '运营商',
                '网络类型',
                '采集时间',
                '解决状态',
                '解决时间',
                '预建站点名称',
                '建站位置地址',
                '网络制式',
                '站点属性',
                '建设类型',
                '需求小区数',
                '是否通过联席会',
                '负责人',
                '联系电话',
                '上报时间',
                '备注信息',
                '[核查]ECI',
                '[核查]TAC',
                '[核查]信号强度',
                '[核查]网络类型',
                '[核查]经度',
                '[核查]纬度'
            ];


            //添加弱覆盖需求信息（预留到excel填写）
           /* for (var i in result) {
                result[i]['coll_ID'] = "";
                result[i]['preStName'] = "";
                result[i]['stAddress'] = "";
                result[i]['netModel'] = "";
                result[i]['stPrope'] = "";
                result[i]['buildType'] = "";
                result[i]['reqCellNum'] = "";
                result[i]['isPass'] = "";
                result[i]['personCharge'] = "";
                result[i]['personTel'] = "";
                result[i]['reportTime'] = ""

            }*/


            var fileName = '全部覆盖_信息_导出文件_' + params['user_account'] + '.xlsx';

            var filePath = '../public/static/file/exportExcel/' + fileName;
            //导出创建Excel表

            excelService.createExcel(header, result, filePath, function (err, result) {
                if (err) {
                    app.logger.info("全部_覆盖_记录_导出失败:\n" + err);
                    /*success, code, msg, data, err*/
                    cb(utils.returnMsg(false, '1000', '文件导出失败。', {result: result, fileName: fileName}, err));
                }
                else {
                    cb(utils.returnMsg(true, '1000', '文件导出成功。', {result: result, fileName: fileName}, null));
                }
            });


        }

    });


};


/**
 *  根据条件，查询弱覆盖信息
 * @param params 查询条件
 * @param cb 回调方法，查询成功，返回查询数据，查询失败，返回错误提示信息
 */
exports.getWeekCoverData = function (params, cb) {

    //查询条件
    var queryDateStart = params.queryDateStart;
    var queryDateEnd = params.queryDateEnd;
    var city = params.city;
    var firstScene = params.firstScene;
    var secondScene = params.secondScene;


    //分页和排序
    var page = params.page - 1;
    var rows = params.rows;
    var sort = params.sort;
    var order = params.order;

    if (page < 0) {
        page = 0
    }


    //判断查询条件
    if (city === '全部' || city === undefined || city === '请选择地市') {
        city = '';
    }
    if (firstScene === '全部' || firstScene === undefined || firstScene === '请选择场景') {
        firstScene = '';
    }
    if (secondScene === '全部' || secondScene === undefined || secondScene === '请选择场景') {
        secondScene = '';
    }

    //合成场景查询条件
    var overlayScene = firstScene + '_' + secondScene;

    var sql1, sql2;
    if (sort === undefined && order === undefined) {

        //查询所有数据，根据区县、场景和采集时间

        sql1 = 'select * from bu_collect_info ' +

            'where district like ' + '"%' + city + '%"' +
            ' and overlayScene like ' + '"%' + overlayScene + '%"' +
            ' and collTime between ' + '"' + queryDateStart + '"' + ' and ' + '"' + queryDateEnd + ' 23:59:59"' +
            ' and deleteFlag="0" ' +
            ' and BSSS <='+config.app.minBSSS;

        //查询条件，区县、场景、采集时间和信号强度低于-110

        sql2 = 'select * from bu_collect_info ' +

            'where district like ' + '"%' + city + '%"' +
            ' and overlayScene like ' + '"%' + overlayScene + '%"' +
            ' and collTime between ' + '"' + queryDateStart + '"' + ' and ' + '"' + queryDateEnd + ' 23:59:59"' +
            ' and deleteFlag="0" ' +
            ' and BSSS <='+config.app.minBSSS+
            ' limit ' + page * rows + ',' + rows

        ;
    } else {

        //查询所有的弱覆盖数据，根据区县、场景和采集时间

        sql1 = 'select * from bu_collect_info ' +

            'where district like ' + '"%' + city + '%"' +
            ' and overlayScene like ' + '"%' + overlayScene + '%"' +
            ' and collTime between ' + '"' + queryDateStart + '"' + ' and ' + '"' + queryDateEnd + ' 23:59:59"' +
            ' and deleteFlag="0" ' +
            ' and BSSS <='+config.app.minBSSS;

        //查询条件，区县、场景、采集时间和信号强度低于-110，并排序

        sql2 = 'select * from bu_collect_info ' +

            'where district like ' + '"%' + city + '%"' +
            ' and overlayScene like ' + '"%' + overlayScene + '%"' +
            ' and collTime between ' + '"' + queryDateStart + '"' + ' and ' + '"' + queryDateEnd + ' 23:59:59"' +
            ' and deleteFlag="0" ' +
            ' and BSSS <='+config.app.minBSSS+
            ' ORDER BY ' + sort + ' ' + order +
            ' limit ' + page * rows + ',' + rows

        ;
    }




    //查询并加工数据，完成后返回到前台
    model.query(sql1, [], function (err, row) {
        if (err) {
            app.logger.info("获取弱覆盖记录总长度失败:\n"+err);
            cb(utils.returnMsg4EasyuiPaging(false, '0000', '获取数据长度失败', err, null));
        }

        else {
            model.query(sql2, [], function (err, rows) {
                if (err) {
                    app.logger.info("获取弱覆盖记录数据失败:\n"+err);
                    cb(utils.returnMsg4EasyuiPaging(false, '0000', '获取数据失败', err, null));
                }

                else {


                    var result = [];

                    for (var i in rows) {
                        result.push(rows[i]);
                    }

                    //返回分页数据
                    cb(utils.returnMsg4EasyuiPaging(true, '1000', '查询数据成功。', result, row.length));

                }

            });


        }

    });


};

/**
 * 点击同位点时，查询4G弱覆盖数据（说明该弱覆盖下有2G网络覆盖情况），查询结果并返回
 * @param params
 * @param cb
 */
exports.getWeekCover2GData = function (params, cb) {

    //查询条件
    var queryDateStart = params.queryDateStart;
    var queryDateEnd = params.queryDateEnd;
    var city = params.city;
    var firstScene = params.firstScene;
    var secondScene = params.secondScene;


    // var lookfor2Gloca = params.BSSSfor2G;
    // console.log('---------------2222222222222' + lookfor2Gloca) ;


    //分页和排序
    var page = params.page - 1;
    var rows = params.rows;
    var sort = params.sort;
    var order = params.order;

    if (page < 0) {
        page = 0
    }


    //判断查询条件
    if (city === '全部' || city === undefined || city === '请选择地市') {
        city = '';
    }
    if (firstScene === '全部' || firstScene === undefined || firstScene === '请选择场景') {
        firstScene = '';
    }
    if (secondScene === '全部' || secondScene === undefined || secondScene === '请选择场景') {
        secondScene = '';
    }

    //合成场景查询条件
    var overlayScene = firstScene + '_' + secondScene;

    var sql1, sql2;
    if (sort === undefined && order === undefined) {

        //查询所有数据，根据区县、场景和采集时间

        sql1 = 'select * from bu_collect_info ' +

            'where district like ' + '"%' + city + '%"' +
            ' and overlayScene like ' + '"%' + overlayScene + '%"' +
            ' and collTime between ' + '"' + queryDateStart + '"' + ' and ' + '"' + queryDateEnd + ' 23:59:59"' +
            ' and deleteFlag="0" ' +
            ' and NetworkOperatorName like ' + '"%4G%"'+
            ' and BSSS ='+config.app.BSSSfor2G;

        //查询条件，区县、场景、采集时间和信号强度低于-110

        sql2 = 'select * from bu_collect_info ' +

            'where district like ' + '"%' + city + '%"' +
            ' and overlayScene like ' + '"%' + overlayScene + '%"' +
            ' and collTime between ' + '"' + queryDateStart + '"' + ' and ' + '"' + queryDateEnd + ' 23:59:59"' +
            ' and deleteFlag="0" ' +
            ' and BSSS ='+config.app.BSSSfor2G+
            ' and NetworkOperatorName like ' + '"%4G%"'+
            ' limit ' + page * rows + ',' + rows

        ;
    } else {

        //查询所有的弱覆盖数据，根据区县、场景和采集时间

        sql1 = 'select * from bu_collect_info ' +

            'where district like ' + '"%' + city + '%"' +
            ' and overlayScene like ' + '"%' + overlayScene + '%"' +
            ' and collTime between ' + '"' + queryDateStart + '"' + ' and ' + '"' + queryDateEnd + ' 23:59:59"' +
            ' and deleteFlag="0" ' +
            ' and NetworkOperatorName like ' + '"%4G%"'+
            ' and BSSS ='+config.app.BSSSfor2G;

        //查询条件，区县、场景、采集时间和信号强度低于-110，并排序

        sql2 = 'select * from bu_collect_info ' +

            'where district like ' + '"%' + city + '%"' +
            ' and overlayScene like ' + '"%' + overlayScene + '%"' +
            ' and collTime between ' + '"' + queryDateStart + '"' + ' and ' + '"' + queryDateEnd + ' 23:59:59"' +
            ' and deleteFlag="0" ' +
            ' and BSSS ='+config.app.BSSSfor2G+
            ' and NetworkOperatorName like ' + '"%4G%"'+
            ' ORDER BY ' + sort + ' ' + order +
            ' limit ' + page * rows + ',' + rows

        ;
    }




    //查询并加工数据，完成后返回到前台
    model.query(sql1, [], function (err, row) {
        if (err) {
            app.logger.info("获取弱覆盖记录总长度失败:\n"+err);
            cb(utils.returnMsg4EasyuiPaging(false, '0000', '获取数据长度失败', err, null));
        }

        else {
            model.query(sql2, [], function (err, rows) {
                if (err) {
                    app.logger.info("获取弱覆盖记录数据失败:\n"+err);
                    cb(utils.returnMsg4EasyuiPaging(false, '0000', '获取数据失败', err, null));
                }

                else {


                    var result = [];

                    for (var i in rows) {
                        result.push(rows[i]);
                    }

                    //返回分页数据
                    cb(utils.returnMsg4EasyuiPaging(true, '1000', '查询数据成功。', result, row.length));

                }

            });


        }

    });


};

/**
 * 根据查询条件，查找有2G网络覆盖的4G弱覆盖数据，并返回这些2G数据
 * @param params
 * @param cb
 */
exports.get2GDataForm4G = function (params, cb) {

    //查询条件
    var GPS = params.GPS;
    var BSSS = params.BSSS;
    var TAC = params.TAC;
    var collTime = params.collTime;
    var address = params.address;
    // var NetworkOperatorName = params.NetworkOperatorName;


    console.log('----1111------' +GPS);
    console.log('----2222------' +BSSS);
    console.log('----3333------' +TAC);
    console.log('----4444------' +collTime);
    console.log('----55555------' +address);

    //分页和排序
    // var page = params.page - 1;
    // var rows = params.rows;
    // var sort = params.sort;
    // var order = params.order;
    //
    // if (page < 0) {
    //     page = 0
    // }



    var sql1 = 'select * from bu_collect_info ' +

            'where GPS like ' + '"%' + GPS + '%"' +
            ' and TAC like ' + '"%' + TAC + '%"' +
            ' and collTime like ' + '"%' + collTime + '%"' +
            ' and NetworkOperatorName like ' + '"%2G%"'

            ;
    // ' and BSSS ='+config.app.BSSSfor2G;


console.log(sql1)

    //查询并加工数据，完成后返回到前台
    model.query(sql1, [], function (err, rows) {
        if (err) {
            app.logger.info("根据4G弱覆盖查询2G覆盖数据失败:\n"+err);
            cb(utils.returnMsg(false, '0000', '获取数据2G失败', err, null));
            // cb(utils.returnMsg4EasyuiPaging();
        }

        else {

            var result = [];

            for (var i in rows) {
                result.push(rows[i]);
            }

// console.log(result)
            //返回分页数据
            cb(utils.returnMsg(true, '1000', '查询数据成功。',  result, null))
            // cb(utils.returnMsg4EasyuiPaging(true, '1000', '查询数据成功。', {data:result}, rows.length));

        }

    });


};




/**
 * 根据条件获取导出弱覆盖信息文件数据
 * @param params 查询条件
 * @param cb 回调方法，成功后返回数据以供生成excel
 */
exports.getWeekExcelData = function (params, cb) {
    //编辑查询条件
    var queryDateStart = params.queryDateStart;
    var queryDateEnd = params.queryDateEnd;
    var city = params.city;
    var firstScene = params.firstScene;
    var secondScene = params.secondScene;
    //判断查询条件
    if (city === '全部' || city === undefined || city === '请选择地市') {
        city = '';
    }
    if (firstScene === '全部' || firstScene === undefined || firstScene === '请选择场景') {
        firstScene = '';
    }
    if (secondScene === '全部' || secondScene === undefined || secondScene === '请选择场景') {
        secondScene = '';
    }

    //合成场景查询条件
    var overlayScene = firstScene + '_' + secondScene;


    var sql1 = 'SELECT weak_id,'+
        'city,'+
        'district,'+
        'address,'+
        'SUBSTRING_INDEX(overlayScene,"_",1)asoverlayScene1,'+
        'SUBSTRING_INDEX(overlayScene,"_",-1)asoverlayScene2,'+
        'GpsLon,'+
        'GpsLat,'+
        'ECI,'+
        'TAC,'+
        'BSSS,'+
        'NetworkOperatorName,'+
        'netWorkType,'+
        'collectUsername,'+
        'phoneNumber,'+
        'FromDepartment,'+
        'collTime,'+
        'phoneType,'+
        'solveStatus,'+
        'solveTime,'+
        'preStName,'+
        'stAddress,'+
        'netModel,'+
        'stPrope,'+
        'buildType,'+
        'reqCellNum,'+
        'isPass,'+
        'personCharge,'+
        'personTel,'+
        'demand_reportTime,'+
        'confirm_eci,'+
        'confirm_tac,'+
        'confirm_bsss,'+
        'confirm_networktype,'+
        'confirm_lon,'+
        'confirm_lat,'+
        'im_remark '+

        ' FROM weak_and_demand' +
        ' where district like ' + '"%' + city + '%"' +
        ' and overlayScene like ' + '"%' + overlayScene + '%"' +
        ' and collTime between ' + '"' + queryDateStart + '"' + ' and ' + '"' + queryDateEnd + ' 23:59:59"' +
        ' and deleteFlag="0" ' +
        ' and BSSS <='+config.app.minBSSS;

    //查询并加工数据，完成后返回到前台
    model.query(sql1, [], function (err, row) {
        if (err) {
            app.logger.info("获取弱覆盖记录用于导出失败:\n"+err);
            cb(utils.returnMsg(false, '0000', '获取数据失败', null, err));
        }
        else {

            var result = [];

            for (var i in row) {
                result.push(row[i]);
            }


            /**
             *
             * @type {string[]}
             */

                //设置导出excel头
            var header = [
                    '需求id',
                    '城市',
                    '区县',
                    '详细地址',
                    '第一覆盖场景',
                    '第二覆盖场景',
                    '经度',
                    '纬度',
                    'ECI',
                    'TAC',
                    '信号强度',
                    '运营商',
                    '网络类型',
                    '上传',
                    '手机号',
                    '部门',
                    '采集时间',
                    '手机型号',
                    '解决状态',
                    '解决时间',

                    '预建站点名称',
                    '建站位置地址',
                    '网络制式',
                    '站点属性',
                    '建设类型',
                    '需求小区数',
                    '是否通过联席会',
                    '负责人',
                    '联系电话',
                    '上报时间',
                    '确认点eci',
                    '确认点tac',
                    '确认点信号强度',
                    '确认点网络类型',
                    '确认点经度',
                    '确认点纬度',
                    '备注'
                ];

            var fileName = '弱覆盖_信息_导出_文件_' + params['user_account'] + '.xlsx';
            var filePath = '../public/static/file/exportExcel/' + fileName;
            //导出创建Excel表

            excelService.createExcel(header, result, filePath, function (err, result) {
                if (err) {
                    app.logger.info("弱覆盖记录导出失败:\n"+err);
                    /*success, code, msg, data, err*/
                    cb(utils.returnMsg(false, '1000', '文件导出失败。', {result: result, fileName: fileName}, err));
                }
                else {
                    cb(utils.returnMsg(true, '1000', '文件导出成功。', {result: result, fileName: fileName}, null));
                }
            });


        }

    });


};



exports.updateWeekStatus = function (params, cb) {

    //插入数据sql
    var sql = 'UPDATE bu_collect_info SET ' +
        ' solveStatus=' + '"' + params.nowStatus + '"' +
        ' WHERE ID=' + '"' + params.ID + '"';


    model.query(sql, params, function (err, rows) {
        if (err) {
            app.logger.info("弱覆盖记录状态更新失败:\n"+err);
            cb(utils.returnMsg(false, '0000', '写入数据失败。', null, null));

        } else {
            //成功后返回插入数据条数
            cb(utils.returnMsg(true, '1000', '数据写入成功。', rows.affectedRows + '条数据已更新。', null));
        }

    });


};




exports.SaveWeekData=function (data,loginName,cb) {
    var sqlParamsEntity = [];
for(var i in data){
    var sql = 'INSERT INTO bu_collect_info(ID,city,district,address,overlayScene,GpsLon,GpsLat,ECI,TAC,BSSS,collectUsername,phoneNumber,FromDepartment,NetworkOperatorName,netWorkType,phoneType,collTime,solveStatus,solveTime' +
        ',createPersion,createTime,alterpersion,alterTime) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
    var time=sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');

    var param = [
        uuid.v1(),
        data[i].city,
        data[i].zone,
        data[i].address,
        data[i].firstScene+'_'+data[i].secondScene,
        data[i].localX,
        data[i].localY,
        data[i].eci,
        data[i].tac,
        data[i].bsss,
        data[i].collName,
        data[i].collPhoneNumber,
        data[i].collDempart,
        data[i].oper,
        data[i].nettype,
        data[i].phoneStatus,
        data[i].collTime,
        data[i].collStatus,
        data[i].solveTime,
        loginName,
        time,
        loginName,
        time];
    sqlParamsEntity.push(model.getNewSqlParamEntity(sql, param));
}
    model.execTrans(sqlParamsEntity, function (err,res) {
            if(err){
                cb(utils.returnMsg(false, '1010', '全部数据导入失败', null, err));
            }else{
                cb(utils.returnMsg(true, '1000', sqlParamsEntity.length+'条数据导入成功', res, null));
            }
    });


};


/**
 * 弱覆盖需求视图创建语句
 *
 *
 *
 *
 */
//
// CREATE VIEW weak_and_demand as (SELECT
// /*弱覆盖表*/
// bu_collect_info.ID as weak_id,
// bu_weak_coverage_demand.ID as demand_id,
//     address,
//     collTime,
//     GpsLon,
//     GpsLat,
//     ECI,
//     TAC,
//     BSSS,
//     city,
//     collectUsername,
//     phoneNumber,
//     FromDepartment,
//     phoneType,
//     overlayScene,
//     district,
//     NetworkOperatorName,
//     netWorkType,
//     solveStatus,
//     solveTime,
// bu_collect_info.createPersion as weak_createPersion,
//     bu_collect_info.createTime createTime,
//     bu_collect_info.alterpersion weak_alterpersion,
//     bu_collect_info.alterTime weak_alterTime,
//     deleteFlag,
//     /*确认表*/
//     im_remark,
// bu_weak_confirmation.reportTime as confirm_reportTime,
// bu_weak_confirmation.reportPersion as confirm_reportPersion,
// bu_weak_confirmation.createPersion as confirm_createPersion,
// bu_weak_confirmation.createTime as confirm_createTime,
//     confirm_eci,
//     confirm_tac,
//     confirm_bsss,
//     confirm_networktype,
//     confirm_lon,
//     confirm_lat,
//     /*需求表*/
//     preStName,
//     stAddress,
//     netModel,
//     stPrope,
//     buildType,
//     reqCellNum,
//     isPass,
//     personCharge,
//     personTel,
// bu_weak_coverage_demand.reportTime as demand_reportTime
// FROM (bu_collect_info LEFT JOIN bu_weak_confirmation ON bu_collect_info.ID=coll_id)
// LEFT JOIN bu_weak_coverage_demand ON demand_id=bu_weak_coverage_demand.ID)





