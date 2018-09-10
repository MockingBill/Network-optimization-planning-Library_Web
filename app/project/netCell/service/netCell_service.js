/**
 *  Created with JetBrains WebStorm.
 *   User: fungdong
 *   Date: 2018/3/27
 *   Time: 上午10:27
 */

var utils = require('gmdp').init_gmdp.core_app_utils;
var model = require('../model/mysqlModel');
var app=require('../../../../app');
var config=require('../../../../config');


/**
 * 获取所有覆盖数据
 * @param params 查询条件
 * @param cb 返回查询数据
 */
exports.getNetCellData = function (params, cb) {
        //获取查询条件
        var queryDateStart = params.queryDateStart;
        var queryDateEnd = params.queryDateEnd;
        var city = params.city;
        var firstScene = params.firstScene;
        var secondScene = params.secondScene;


        //用于分页和排序参数
        var page = params.page - 1;
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

    //场景条件封装
    var overlayScene = firstScene + '_' + secondScene;

    var sql, sql2;
   //若果不排序（第一次进入）则，只分页，如果有排序（点击排序时），则进入排序查询
    if (sort === undefined && order === undefined) {

        //查询所有数据，根据区县、场景和采集时间。sql查询总数，sql2查询分页
        sql = 'select * from netcellnet ' +
            ' where district like ' + '"%' + city + '%"' +
            ' and overlayScene like ' + '"%' + overlayScene + '%"' +
            ' and deleteFlag="0" '+
            ' and collTime between ' + '"' + queryDateStart + '"' + ' and ' + '"' + queryDateEnd + ' 23:59:59"';
        sql2 = 'select * from netcellnet ' +
            ' where district like ' + '"%' + city + '%"' +
            ' and overlayScene like ' + '"%' + overlayScene + '%"' +
            ' and deleteFlag="0" '+
            ' and collTime between ' + '"' + queryDateStart + '"' + ' and ' + '"' + queryDateEnd + ' 23:59:59"' +
            ' limit ' + page * rows + ',' + rows
        ;
    } else {

        //查询所有数据，根据区县、场景和采集时间。sql查询总数，sql2查询分页并排序
        sql = 'select * from netcellnet ' +
            'where district like ' + '"%' + city + '%"' +
            ' and overlayScene like ' + '"%' + overlayScene + '%"' +
            ' and deleteFlag="0" '+
            ' and collTime between ' + '"' + queryDateStart + '"' + ' and ' + '"' + queryDateEnd + ' 23:59:59"';
        sql2 = 'select * from netcellnet ' +
            ' where district like ' + '"%' + city + '%"' +
            ' and overlayScene like ' + '"%' + overlayScene + '%"' +
            ' and deleteFlag="0" '+
            ' and collTime between ' + '"' + queryDateStart + '"' + ' and ' + '"' + queryDateEnd + ' 23:59:59"' +
            ' ORDER BY ' + sort + ' ' + order +
            ' limit ' + page * rows + ',' + rows
        ;
    }


    // 根据查询条件进行查询，加工查询后的数据，返回到前端显示
    model.query(sql, [], function (err, row) {
        if (err) {
            app.logger.info("获取所有数据查询失败:\n"+err);
            cb(utils.returnMsg4EasyuiPaging(false, '0000', '获取全部数据失败', err, null));
        }

        else {
            model.query(sql2, [], function (err, rows) {
                if (err) {
                    app.logger.info("获取所有数据查询失败:\n"+err);
                    cb(utils.returnMsg4EasyuiPaging(false, '0000', '获取全部数据失败', err, null));
                }

                else {

                    var result = [];

                    for (var i in rows) {
                        result.push(rows[i]);
                    }
                    //返回查询数据和总数条数
                    cb(utils.returnMsg4EasyuiPaging(true, '1000', '查询数据成功。', result, row.length));

                }

            });


        }

    });


};


/**
 * 添加一条弱覆盖信息信息记录
 * @param params 要添加的如覆盖信息
 * @param cb
 */
exports.insertNetCellData = function (loginName, params, cb) {

    //添加时间（采集时间）
    var month = (new Date()).getMonth() + 1;
    var day = (new Date()).getDate();
    var hour = (new Date()).getHours();
    var min = (new Date()).getMinutes();

    //保存导入人名
    params.push(loginName);

    var collTime = (new Date().getFullYear()) + '-' + ((month >= 10) ? month : '0' + month) + '-' + ((day >= 10) ? day : '0' + day) + ' ' + ((hour >= 10) ? hour : '0' + hour) + ':' + ((min >= 10) ? min : '0' + min);

    params.push(collTime);
    params.push('');
    params.push('');

    //添加插入sql语句

    var sql = 'INSERT INTO netcellnet(ID, ECI ,TAC ,BSSS ,GPS ,phoneNumber ,phoneType ,overlayScene ,district ,address ,NetworkOperatorName,city,collTime ,solveStatus,solveTime,createPersion,createTime,alterpersion,alterTime) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';

   try {
       model.query(sql, params, function (err, rows) {
           if (err) {
               app.logger.info("添加一条弱覆盖信息或导入弱覆盖记录失败:\n" + err);
               cb(err, '插入数据失败。');

           } else {
               //成功后返回插入数据条数
               cb(null, rows.affectedRows + '条数据已保存。');
           }

       });
   }catch(err){
       app.logger.info("数据库连接错误:\n"+err);
       cb(false,'数据库连接失败。');
   }
};


var uuid = require('uuid');
/**
 * 添加一条弱覆盖信息信息记录:仅仅为了弱覆盖excel导入。
 * @param params 要添加的如覆盖信息
 * @param cb
 */
exports.insertNetCellDataForInput = function (loginName, params, cb) {
    params[18]="";
    var isNull = false;
    for (var i=0;i<=15;i++) {
        if (params[i] == undefined || params[i] == null || params[i] == "") {
            isNull = true
        }
    }
    if (isNull) {
        err= new Error('data is null');
        app.logger.info("添加一条弱覆盖信息或导入弱覆盖记录失败:\n" + err);
        cb(err, '插入数据失败。');
    }

     else {
        params.splice(0,0,uuid.v4());
        params[4]=params[4]+"_"+params[5];
        params[5]="("+params[6]+","+params[7]+")";
        params[6]=params[8];
        params[7]=params[9];
        params[8]=params[10];
        params[9]=params[11];
        params[10]=params[12];
        params[11]=params[13];
        params[12]=params[14];
        params[13]=params[15];
        params[14]=params[16];
        params[15]=loginName;
        params[16]=getCurrentTime();
        params[17]="";
        var sql = 'INSERT INTO netcellnet(ID,city,district,address,overlayScene,GPS,ECI,TAC,BSSS,NetworkOperatorName,phoneNumber,phoneType,collTime,solveStatus,solveTime,createPersion,createTime,alterpersion,alterTime) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        try {
            model.query(sql, params, function (err, rows) {
                if (err) {
                    app.logger.info("添加一条弱覆盖信息或导入弱覆盖记录失败:\n" + err);
                    cb(err, '插入数据失败。');

                } else {
                    //成功后返回插入数据条数
                    cb(null, rows.affectedRows + '条数据已保存。');
                }

            });
        } catch (err) {
            app.logger.info("数据库连接错误:\n" + err);
            cb(err, '数据库连接失败。');
        }
    }
};

/**
 * 删除选中的弱覆盖数据
 * @param id 选中的ID，可多条
 * @param cb 回调，成功后返回删除的条数，失败返回错误原因
 */
exports.deleteWeekData = function (id, cb) {


    if (id.length == 0) {
        app.logger.info("传入数据id数组为空:\n");
        cb(utils.returnMsg(false, '0000', '删除失败。', '条数据已删除', null));

    } else {
        var length = id.length;

        //遍历id，逐条删除
        for (var i = 0; i < id.length; i++) {


            /**
             *   var sql = 'UPDATE bu_weak_coverage_demand SET ' +
             ' preStName=' +'"'+ params.preStName +'"'+
             ' ,netModel=' +'"'+ params.netModel +'"'+
             * @type {string}
             */

            var sql = 'UPDATE netcellnet SET deleteFlag="1" where ID="' + id[i].toString() + '"';

var flag=false;
            model.query(sql, [], function (err, result) {

                if (err) {
                    app.logger.info("删除一条弱覆盖记录失败:\n"+err);
                } else {
                    flag=true;
                }

            });

        }

        //返回删除的条数
        cb(utils.returnMsg(true, '1000', '删除成功。', length + '条数据已删除', null));
    }


};


/**
 * 查找所有覆盖的统计数据，用于绘柱形图
 * @param params 查找的条件，包括采集时间，区县、场景
 * @param cb 回调方法，查询成功返回所有覆盖的区县数量和场景数量
 */
exports.getCheckAll = function (params, cb) {

    //编辑查询条件
    var queryDateStart = params.queryDateStart;
    var queryDateEnd = params.queryDateEnd;
    var city = params.city;
    var firstScene = params.firstScene;
    var secondScene = params.secondScene;
    var target=params.target;


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

    var overlayScene = firstScene + '_' + secondScene;


    //统计区县的数量
    var sql1 = 'SELECT count(*) as num ,district from netcellnet ' +
        ' where collTime between ' + '"' + queryDateStart + '"' + ' and ' + '"' + queryDateEnd + ' 23:59:59"' +
        ' and deleteFlag='+'"0"'+
        ' GROUP BY district';
    var sql2="";
    if(target!=undefined){
        sql2 = 'SELECT count(*) as num ,overlayScene from netcellnet ' +
            ' where collTime between ' + '"' + queryDateStart + '"' + ' and ' + '"' + queryDateEnd + ' 23:59:59"' +
            ' and deleteFlag="0" and district="'+target+'"'+
            ' GROUP BY overlayScene';
    }else{
        sql2 = 'SELECT count(*) as num , overlayScene from netcellnet ' +
            ' where collTime between ' + '"' + queryDateStart + '"' + ' and ' + '"' + queryDateEnd + ' 23:59:59"' +
            ' and deleteFlag="0" '+
            ' GROUP BY overlayScene';
    }
    //统计场景的数量

    model.query(sql1, [], function (err, result1) {

        if (err) {
            app.logger.info("数据库连接失败:\n"+err);
        } else {

            model.query(sql2, [], function (err, result) {

                if (err) {

                    app.logger.info("柱形图数据获取失败:\n"+err);

                } else {
                    //区县数组
                    var citis = [];
                    //区县数量
                    var num1 = [];
                    for (var i in result1) {
                        citis.push(result1[i].district);
                        num1.push(result1[i].num)
                    }

                    //场景数组

                    //场景数量
                    var one_level_scene={};
                    var drilldown=[];
                    for (var i in result) {
                        var on1_sence=result[i].overlayScene.split('_')[0];
                        one_level_scene[on1_sence]=on1_sence;
                    }
                    var scenes=[];

                    for(var i in one_level_scene){
                        drilldown.push({
                            name: i,
                            id: i,
                            data:[]
                        });
                        scenes.push(i);
                    }

                    var num2=[];
                    for(var i in scenes){
                        num2.push(0);
                    }

                    for (var i in result) {
                        var one_sence=result[i].overlayScene.split('_')[0];
                        var two_sence=result[i].overlayScene.split('_')[1];

                        for(var j in drilldown){
                            if(drilldown[j].name==one_sence){
                                drilldown[j].data.push([two_sence,result[i].num]);
                                break;
                            }
                        }
                        for(var f in scenes){
                            if(scenes[f]==one_sence){
                                num2[f]=num2[f]+Number(result[i].num);

                            }
                        }
                    }

                    var one_level_result=[];
                    for(var i in num2){
                        one_level_result.push({
                            name:scenes[i],
                            y: num2[i],
                            drilldown: scenes[i]
                        });
                    }

                    //返回区县和场景的数据和个数
                    cb(utils.returnMsg(true, '1000', '获取数据成功。', {
                        citis: citis,
                        num1: num1,
                        scenes: one_level_result,
                        num2: num2,
                        drilldownData:drilldown
                    }, ''));
                }


            });


        }


    });


};


/**
 * 查找弱覆盖的统计数据，用于绘柱形图
 * @param params 查找条件 包括查找时间queryDate，区县city和场景
 * @param cb 回调方法，查找成功返回弱覆盖按照区县统计和场景统计
 */
exports.getCheckWeek = function (params, cb) {



    //编辑查询条件
    var queryDateStart = params.queryDateStart;
    var queryDateEnd = params.queryDateEnd;
    var city = params.city;
    var firstScene = params.firstScene;
    var secondScene = params.secondScene;
    var target=params.target;


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

    var overlayScene = firstScene + '_' + secondScene;


    //统计区县的数量
    var sql1 = 'SELECT count(*) as num ,district from netcellnet ' +
        ' where collTime between ' + '"' + queryDateStart + '"' + ' and ' + '"' + queryDateEnd + ' 23:59:59"' +
        ' and deleteFlag="0" and BSSS<='+config.app.minBSSS+
        ' GROUP BY district';
    var sql2="";
    if(target!=undefined){
        sql2 = 'SELECT count(*) as num ,overlayScene from netcellnet ' +
            ' where collTime between ' + '"' + queryDateStart + '"' + ' and ' + '"' + queryDateEnd + ' 23:59:59"' +
            ' and deleteFlag="0" and BSSS<='+config.app.minBSSS+' and district="'+target+'"'+
            ' GROUP BY overlayScene';
    }else{
        sql2 = 'SELECT count(*) as num , overlayScene from netcellnet ' +
            ' where collTime between ' + '"' + queryDateStart + '"' + ' and ' + '"' + queryDateEnd + ' 23:59:59"' +
            ' and deleteFlag="0" and BSSS<='+config.app.minBSSS+
            ' GROUP BY overlayScene';
    }
    //统计场景的数量

    model.query(sql1, [], function (err, result1) {

        if (err) {
            app.logger.info("数据库连接失败:\n"+err);
        } else {

            model.query(sql2, [], function (err, result) {

                if (err) {

                    app.logger.info("柱形图数据获取失败:\n"+err);

                } else {
                    //区县数组
                    var citis = [];
                    //区县数量
                    var num1 = [];
                    for (var i in result1) {
                        citis.push(result1[i].district);
                        num1.push(result1[i].num)
                    }

                    //场景数组

                    //场景数量
                    var one_level_scene={};
                    var drilldown=[];
                    for (var i in result) {
                        var on1_sence=result[i].overlayScene.split('_')[0];
                        one_level_scene[on1_sence]=on1_sence;
                    }
                    var scenes=[];

                    for(var i in one_level_scene){
                        drilldown.push({
                            name: i,
                            id: i,
                            data:[]
                        });
                        scenes.push(i);
                    }

                    var num2=[];
                    for(var i in scenes){
                        num2.push(0);
                    }

                    for (var i in result) {
                        var one_sence=result[i].overlayScene.split('_')[0];
                        var two_sence=result[i].overlayScene.split('_')[1];

                        for(var j in drilldown){
                            if(drilldown[j].name==one_sence){
                                drilldown[j].data.push([two_sence,result[i].num]);
                                break;
                            }
                        }
                        for(var f in scenes){
                            if(scenes[f]==one_sence){
                                num2[f]=num2[f]+Number(result[i].num);

                            }
                        }
                    }

                    var one_level_result=[];
                    for(var i in num2){
                        one_level_result.push({
                            name:scenes[i],
                            y: num2[i],
                            drilldown: scenes[i]
                        });
                    }

                    //返回区县和场景的数据和个数
                    cb(utils.returnMsg(true, '1000', '获取数据成功。', {
                        citis: citis,
                        num1: num1,
                        scenes: one_level_result,
                        num2: num2,
                        drilldownData:drilldown
                    }, ''));
                }


            });


        }


    });



};


function getCurrentTime() {
    var month = (new Date()).getMonth() + 1;
    var day = (new Date()).getDate();
    var hour = (new Date()).getHours();
    var min = (new Date()).getMinutes();
    var createTime = (new Date().getFullYear()) + '-' + ((month >= 10) ? month : '0' + month) + '-' + ((day >= 10) ? day : '0' + day) + ' ' + ((hour >= 10) ? hour : '0' + hour) + ':' + ((min >= 10) ? min : '0' + min);
    return createTime;
}






