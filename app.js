var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var hbs = require('hbs');
//国际化
var i18n = require('i18n');
//日志插件
var log4js = require('log4js');
//config
var config = require('./config');
var app_init = require('./app_init');
var multer=require('multer');
var uuidv3=require("uuid");
var app = express();

// 开发平台
var gmdp = require('gmdp').init_gmdp;

// 路由自动挂载
var tree_utils = gmdp.core_tree_utils;


/*var logHelper = require('./app/common/log/utils/log_util.js');
 var seqHelper = require('./app/common/log/utils/sequence_util.js');


 //装载日志请求
 logHelper.use(app);

 //装载流水号中间件
 app.use(seqHelper.seqCreate);*/

app.use(multer({
    'dest': path.join(__dirname, 'public/static/file/importExcel'),
      rename:function (fieldname,filename) {
        return filename;
    },
    'fileFilter':fileFilter
}));

log4js.configure({
    "appenders": [
        {
            type: 'console'
        },
        {
            type: 'dateFile',
            filename: __dirname+'/logs/app',
            pattern: '-yyyy-MM-dd.log',
            alwaysIncludePattern: true,
            category: 'app'
        }
    ],
    "replaceConsole": true
});

module.exports.logger = log4js.getLogger('app');

app.use(log4js.connectLogger(this.logger,
    {level: 'ALL', format: ':remote-addr :method :url :status :response-time ms'}
));

function fileFilter(req,file,cb){
    if(file.extension==='xlsx'||file.extension==='xls') {
        return cb(null,true);
    }else{
        return cb(new Error('Something went wrong'),null,false);
    }
}



//将全局配置信息传入locals
app.locals.projcfg = config.project;

i18n.configure({
    locales: ['zh_CN'],  // setup some i18n - other i18n default to en_US silently
    defaultLocale: 'zh_CN',
    directory: path.join(__dirname, 'views/common/i18n'),
    updateFiles: false,
    indent: "\t",
    extension: '.json'  // 由于 JSON 不允许注释，所以用 js 会方便一点，也可以写成其他的，不过文件格式是 JSON
});

// 加载系统参数和数据字典
//coreService.init();
gmdp.init_sys();

// 初始化加载的内容
app_init.$(app);

// view engine setup
app.set('views', [path.join(__dirname, 'views'), path.join(__dirname, 'node_modules/gmdp/views')]);

app.set('view engine', 'hbs');
//console.log(__dirname + '/views' + config.project.theme + '/partials');
hbs.registerPartials(__dirname + '/views/partials');

var i18n_helpers = new require('./views/common/helpers/i18n_helpers');
hbs.registerHelper(i18n_helpers);

hbs.registerHelper('ifCond', function (v1, v2, options) {
    //console.log("v1: %s , v2: %s", v1, v2);
    if (v1 === v2) {
        return options.fn(this);
    }
    return options.inverse(this);
});

hbs.registerHelper('eq', function (v1, v2, options) {
    //console.log("v1: %s , v2: %s", v1, v2);
    if (v1 === v2) {
        return options.fn(this);
    }
    return options.inverse(this);
});

hbs.registerHelper('neq', function (v1, v2, options) {
    //console.log("v1: %s , v2: %s", v1, v2);
    if (v1 != v2) {
        return options.fn(this);
    }
    return options.inverse(this);
});

hbs.registerHelper('containKey', function (v1, v2, v3, options) {
    //console.log("v1: %s , v2: %s", v1, v2);
    var super_users = config.routes.super_users;
    var is_super_user = false;
    if (super_users) {
        super_users.forEach(function (item) {
            // 检查规则里面是否存在通配符
            is_super_user = is_super_user || item == v3;
        });
    }
    if (is_super_user) {
        return options.fn(this);
    }
    if (v1) {
        if (v1.hasOwnProperty(v2)) {
            return options.fn(this);
        }
    }
    return options.inverse(this);
});

/**
 * 有一个异常未处理,当v1 V2 为数字时会发生异常
 *
 */
hbs.registerHelper('ifContain', function (v1, v2, options) {

    if (v1.indexOf(v2) === 0) {
        return options.fn(this);
    }
    return options.inverse(this);
});

/**
 * json object转换为string
 */
hbs.registerHelper('tostring', function (v1, options) {

    return JSON.stringify(v1);
});

/**
 * json object转换为tree结构
 */
hbs.registerHelper('totree', function (v1, options) {
    return JSON.stringify(tree_utils.transData(v1, 'id', 'pid', 'children'));
});

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'static/images/favicon.ico')));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

//Mongo-Session
var MongoStore = require('connect-mongo')(session);
app.use(session({
    secret: config.session.secret,//'gmdp_client_secret',
    key: config.session.key,   //这里的name值得是cookie的name，默认cookie的name是：connect.sid
    cookie_maxAge: config.session.cookie_maxAge,  //单位ms，即10分钟后session和相应的cookie失效过期
    resave: config.session.resave,
    saveUninitialized: config.session.saveUninitialized,
    rolling: config.session.rolling ? config.session.rolling : true,
    store: new MongoStore({
        url: config.session.mongodb_url ? config.session.mongodb_url : config.mongdb.url,
        interval: config.session.cookie_maxAge,
        collection: config.session.mongodb_collection ? config.session.mongodb_collection : 'common_user_session',
        touchAfter: 24 * 3600
    })
}));

// 过滤脚本标签中间件

app.use(config.project.appurl, express.static(path.join(__dirname, 'public')));
config.project.home=__dirname;
//国际化支持
app.use(i18n.init);

// cas认证
gmdp.init_cas({app: app});

// 权限检查中间件
app.use(gmdp.core_auth_check);

// 初始化路由
gmdp.init_route({app: app, basePath: config.project.appurl});

// 自动装载工程app目录下的路由
gmdp.core_mount_routes(app, __dirname + '/app', config.routes.is_debug);




// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('common/error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('common/error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
