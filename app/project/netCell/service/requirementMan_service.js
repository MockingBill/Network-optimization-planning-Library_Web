/**
 *  Created with JetBrains WebStorm.
 *   User: fungdong
 *   Date: 2018/4/8
 *   Time: 下午3:36
 */


var utils = require('gmdp').init_gmdp.core_app_utils;
var model = require('../model/mysqlModel');
var excelService = require('../model/execlExport.js');
var uuid = require('uuid');
var app=require('../../../../app');
var config=require('../../../../config');



/**
 * 增加需求信息，写入到数据库
 * @param param 传入的需求信息数
 * @param cb 返回插入结果
 */
exports.addRequirement = function (param, cb) {
    try{
        console.log(param);
        var params = [];
        var ID = uuid.v4();

        params.push(ID);
        params.push(param.coll_ID);
        params.push(param.preStName);
        params.push(param.netModel);
        params.push(param.stAddress);
        params.push(param.stPrope);
        params.push(param.buildType);
        params.push(param.reqCellNum);
        params.push(param.isPass);
        params.push(param.personCharge);
        params.push(param.personTel);
        params.push(param.reportTime);


        console.log('----'+params);
    }catch (e) {
        console.log(e);
    }



    //插入数据sql
    var sql = 'INSERT INTO bu_weak_coverage_demand( ID ,coll_ID,preStName ,netModel  ,stAddress,stPrope ,buildType ,reqCellNum ,isPass ,personCharge ,personTel,reportTime ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)';


    model.query(sql, params, function (err, rows) {
        if (err) {
            app.logger.info("单条需求或导入数据错误:\n"+err);
            cb(utils.returnMsg(false, '0000', '写入数据失败。', null, null));
        } else {
            //成功后返回插入数据条数
            cb(utils.returnMsg(true, '1000', '查询数据成功。', rows.affectedRows + '条数据已保存。', null));
        }

    });


};


/**
 * 修改弱覆盖信息，根据获取的记录ID更新数据
 * @param params 更改的弱覆盖需求数据
 * @param cb 回调方法，成功后提示'修改成功'，失败后提示页面失败原因
 */
exports.updateRequirement = function (params, cb) {

    //更新（修改）需求数据sql
    var sql = 'UPDATE bu_weak_coverage_demand SET ' +
        'preStName=' + params.preStName +
        ' ,netModel=' + params.netModel +
        ' ,stAddress=' + params.stAddress +
        ' ,stPrope=' + params.stPrope +
        ' ,buildType=' + params.buildType +
        ' ,reqCellNum=' + params.reqCellNum +
        ' ,isPass=' + params.isPass +
        ' ,personCharge=' + params.personCharge +
        ' ,personTel=' + params.personTel +
        ' ,reportTime=' + params.reportTime +
        ' WHERE ID=' + params.id;


    model.query(sql, [], function (err, rows) {
        if (err) {
            app.logger.info("修改需求错误:\n"+err);
            cb(utils.returnMsg(false, '0000', '数据写入失败。', null, null));

        } else {
            cb(utils.returnMsg(true, '1000', '查询数据成功。', rows.affectedRows + '条数据已保存。', null));
        }
    });


};


/**
 * 获取弱覆盖需求信息
 * 根据查询条件查找到相关的如覆盖信息，如果这些如覆盖信息有弱覆盖需求，即可找到相关的需求信息
 * @param params 查找条件
 * @param cb 回调方法，查找成功返回结果，失败返回错误原因
 */
exports.getRequirementData = function (params, cb) {


    //查询条件
    var queryDateStart = params.queryDateStart;
    var queryDateEnd = params.queryDateEnd;
    var city = params.city;
    var firstScene = params.firstScene;
    var secondScene = params.secondScene;

    //分页和排序console.log(page);
    var page = params.page ;
    console.log(page);

    var rows = params.rows;
    var sort = params.sort;
    var order = params.order;

    if(page<0 ){
        page = 0
    }


    //查询条件判断
    if (city === '全部' || city === undefined || city === '请选择地市') {
        city = '';
    }
    if (firstScene === '全部' || firstScene === undefined || firstScene === '请选择场景') {
        firstScene = '';
    }
    if (secondScene === '全部' || secondScene === undefined || secondScene === '请选择场景') {
        secondScene = '';
    }

    //合成场景
    var overlayScene = firstScene + '_' + secondScene;


    var sql1, sql2;
    //如果第一次查询（没有排序），则进if,否则进入else
    if (sort === undefined && order === undefined) {

        //查询所有数据
        sql1 = 'SELECT * FROM bu_weak_coverage_demand' +
            ' WHERE coll_ID in (SELECT ID FROM netcellnet' +
            ' where district like ' + '"%' + city + '%"' +
            ' and overlayScene like ' + '"%' + overlayScene + '%"' +
            ' and collTime between ' + '"' + queryDateStart + '"' + ' and ' + '"' + queryDateEnd + ' 23:59:59"' + ')';

        //查询分页数据
        sql2 = 'SELECT * FROM bu_weak_coverage_demand' +
            ' WHERE coll_ID in (SELECT ID FROM netcellnet' +
            ' where district like ' + '"%' + city + '%"' +
            ' and overlayScene like ' + '"%' + overlayScene + '%"' +
            ' and collTime between ' + '"' + queryDateStart + '"' + ' and ' + '"' + queryDateEnd + ' 23:59:59"' + ')' +
            // ' limit ' + page * rows + ',' + rows
        ' limit ' + page * rows+',' + rows

        ;
    } else {
        //查询所有数据
        sql1 = 'SELECT * FROM bu_weak_coverage_demand' +
            ' WHERE coll_ID in (SELECT ID FROM netcellnet' +
            ' where district like ' + '"%' + city + '%"' +
            ' and overlayScene like ' + '"%' + overlayScene + '%"' +
            ' and collTime between ' + '"' + queryDateStart + '"' + ' and ' + '"' + queryDateEnd + ' 23:59:59"' + ')';

        //查询分页数据并分页
        sql2 = 'SELECT * FROM bu_weak_coverage_demand' +
            ' WHERE coll_ID in (SELECT ID FROM netcellnet' +
            ' where district like ' + '"%' + city + '%"' +
            ' and overlayScene like ' + '"%' + overlayScene + '%"' +
            ' and collTime between ' + '"' + queryDateStart + '"' + ' and ' + '"' + queryDateEnd + ' 23:59:59"' + ')' +
            ' ORDER BY ' + sort + ' ' + order +
            ' limit ' + page * rows + ',' + rows
        ;


    }


    //查询并加工数据，完成后返回到前台
    model.query(sql1, [], function (err, row) {
        if (err) {
            app.logger.info("获取需求记录数据总长度失败:\n"+err);
            cb(utils.returnMsg4EasyuiPaging(false, '0000', '获取数据总长度失败', err, null));
        }
        else {
            model.query(sql2, [], function (err, rows) {
                if (err) {
                    app.logger.info("获取需求记录表分页条数失败:\n"+err);
                    cb(utils.returnMsg4EasyuiPaging(false, '0000', '获取数据长度失败', err, null));
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
 * 删除弱覆盖需求信息
 * @param id 获取要删除的弱覆盖需求记录ID
 * @param cb 回调方法，删除成功后提示条数，失败返回原因
 */
exports.deleteRequirementData = function (id, cb) {


    if (id.length == 0) {
        cb(utils.returnMsg(false, '0000', '删除失败。', '条数据已删除', null));

    } else {

        var length = id.length;
        for (var i = 0; i < id.length; i++) {

            //删除数据sql语句
            var sql = 'delete from bu_weak_coverage_demand where ID="' + id[i].toString() + '"';

            model.query(sql, function (err, result) {

                if (err) {
                    app.logger.info("删除需求失败:\n"+err);
                } else {
                    console.log( JSON.stringify(result) );
                }
            });
        }
        cb(utils.returnMsg(true, '1000', '删除成功。', length + '条数据已删除', null));

    }


};


/**
 *  导出弱覆盖需求到Excel 跟据查询条件，将查询出的所有内容导出到Excel
 * @param params 查询条件
 * @param cb 回调
 */
exports.getRequirementExcelData = function (params, cb) {
    //查询条件
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


    //根据查询条件查询sql
    var sql1 = 'SELECT * FROM bu_weak_coverage_demand' +
            ' WHERE coll_ID in (SELECT ID FROM netcellnet' +
            ' where district like ' + '"%' + city + '%"' +
            ' and overlayScene like ' + '"%' + overlayScene + '%"' +
            ' and collTime between ' + '"' + queryDateStart + '"' + ' and ' + '"' + queryDateEnd + ' 23:59:59"' + ')';


    var sql2='SELECT ECI ,TAC,BSSS ,GPS ,phoneNumber,phoneType ,overlayScene,district ,address,NetworkOperatorName,city ,collTime ' +
',solveStatus ,solveTime ,createPersion ,createTime,alterpersion,alterTime,preStName,stAddress,netModel,stPrope,' +
'buildType,reqCellNum,isPass,personCharge,personTel,reportTime FROM netcellnet as A,bu_weak_coverage_demand as B WHERE' +
    ' A.ID=B.coll_ID and ' +
'district like '+'"%' + city + '%"'+' ' +
    'and overlayScene like '+ '"%' + overlayScene + '%"' +' and collTime ' +
    'between '+ '"' + queryDateStart + '"' +' and  ' + '"' + queryDateEnd + ' 23:59:59"';

    //查询并加工数据，并导出到Excel
    model.query(sql2, [], function (err, rows) {
        if (err) {
            app.logger.info("导出需求数据到excel进行查询失败:\n"+err);
            cb(utils.returnMsg(false, '0000', '获取数据失败', null,err));
        }

        else {
            //生成目标数据
            var result = [];
            for (var i in rows) {
                result.push(rows[i]);
            }

            //设置Excel表头
            var header = [
                'ECI',
                'TAC',
                'BSSS',
                'GPS',
                '上传人信息',
                '手机类型',
                '场景',
                '县市',
                '详细地址',
                '运营商与网络制式',
                '地区',
                '采集时间',
                '解决状态',
                '解决时间',
                '创建人账号',
                '创建时间',
                '修改人账号',
                '修改时间',
                '预建站点名称',
                '建站位置地址',
                '网络制式',
                '站点属性',
                '建设类型',
                '需求小区数',
                '是否通过联席会',
                '负责人',
                '联系电话',
                '上报时间'
            ];
            //设置导出地址
            var fileName = '弱覆盖_需求_导出_文件_'+params['user_account']+'.xlsx';

            /*var fileName = '弱覆盖需求_导出文件' + '' + (new Date()).getMinutes() + '' + (new Date()).getSeconds() + '.xlsx';*/
            var filePath = '../public/static/file/exportExcel/' + fileName;


            //导出excel文件
            excelService.createExcel(header, result, filePath, function (err, result) {
                if (err) {
                    app.logger.info("导出需求数据到excel失败:\n"+err);
                    cb(utils.returnMsg(false, '1000', '导出失败。',{result : false,fileName :fileName},err));
                }
                else {
                    //导出成功后，返回数据和文件名
                    cb(utils.returnMsg(true, '1000', '导出成功。',{result : result,fileName :fileName},null));
                }
            });




        }

    });

};


exports.updateRequirementMan = function (id,params, cb) {

    //插入数据sql
    var sql = 'UPDATE bu_weak_coverage_demand SET ' +
        ' preStName=' +'"'+ params.preStName +'"'+
        ' ,netModel=' +'"'+ params.netModel +'"'+
        ' ,stAddress=' +'"'+ params.stAddress +'"'+
        ' ,stPrope=' +'"'+ params.stPrope +'"'+
        ' ,buildType=' +'"'+ params.buildType +'"'+
        ' ,reqCellNum=' +'"'+ params.reqCellNum +'"'+
        ' ,isPass=' +'"'+ params.isPass +'"'+
        ' ,personCharge=' +'"'+ params.personCharge +'"'+
        ' ,personTel=' +'"'+ params.personTel +'"'+
        ' ,reportTime=' +'"'+ params.reportTime +'"'+
        ' WHERE ID=' +'"'+ id+'"';


    model.query(sql, params, function (err, rows) {
        if (err) {
            console.log("写入错误： " + err);
            cb(utils.returnMsg(false, '0000', '写入数据失败。', null, null));

        } else {
            console.log('------修改成功------');

            //成功后返回插入数据条数
            cb(utils.returnMsg(true, '1000', '数据写入成功。', rows.affectedRows + '条数据已更新。', null));
        }

    });


};


exports.isExistsRequirement = function (id, cb) {

    // id = '2222-2-2-2-2-2-2';
     // console.log('----'+id);


    //插入数据sql              ' where district like ' + '"%' + city + '%"' +
    var sql = 'select * from bu_weak_coverage_demand where coll_ID like ' + '"%' + id + '%"';

     console.log(sql);

    model.query(sql, [], function (err, rows) {
        if (err) {
            console.log("查询错误： " + err);
            cb(utils.returnMsg(false, '0000', '数据查询失败。', null, null));

        } else {

            // console.log(rows.length);

                //成功后返回插入数据条数
                cb(utils.returnMsg(true, '1000', '数据查询成功。', rows, null));




        }

    });


};

exports.addExcelRequirement = function (params, cb) {

    //插入数据sql
    var sql = 'INSERT INTO bu_weak_coverage_demand( ID ,coll_ID,preStName ,netModel  ,stAddress,stPrope ,buildType ,reqCellNum ,isPass ,personCharge ,personTel,reportTime ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)';
   try{
       model.query(sql, params, function (err, rows) {
           if (err) {
               console.log("写入错误： " + err);
               cb(err,null);
           } else {
               console.log('------写入成功------');

               console.log(rows);
               //成功后返回插入数据条数
               cb(  null,rows.affectedRows + '条数据已保存。');
           }

       });
   }catch (e) {
       console.log("进入了");
       cb(e,0);
   }


};


