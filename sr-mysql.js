/*
 * NodeJs 后端服务程序，使用mysql数据库存储数据
 *
 * node库安装
 * 1） npm install http url formidable fs path mysql --save
 * 2） cnpm install http url formidable fs path mysql --save
 *
 * 使用App工具添加请求的路由和业务处理逻辑即可
 * App.route(url, deal)
 * App.glId() # 返回以当前时间的年月日时分秒拼接而成的数字id，数据类型必须long型
 * App.gsId() # 返回短ID，数据类型为int即可
 * 
 * 使用数据库的表的工具
 * AppTbs.utl.createTable(which, sql=>{})
 * 
 * 使用图片上传
 * 配置路由，即可，但是注意返回值中的不同之处：
 * 1） 会以你提交数据的key作为返回值的key，返回结果为数组，包含多个文件的基本信息
 * 2） 使用 firstFile 作为首个文件的信息记录key，值为首个文件的基本信息
 * 3） 文件信息主要分为，文件的原本信息和新存储的名称。如果取文件，注意需要使用新名称来实现
 * 4） 如果需要记录文件信息，可以在路由处理器之中来记录到数据库
 * 
 * 使用缓存工具
 * App.cacheAdd(k,v);
 * v = App.cacheGet(k);
 * f = App.cacheContain(k);
 * App.cacheRemove(k);
 */
const App = require('./http-2.0.js');
const mysql = require('./mysql-2.0.js');
const DbUtil = require('./dbUtil-mysql.js');
const AppTbs = require('./tables.js');
const PORT = 3201;

/** 启动服务（同时也是服务配置） */
App.start(PORT, () => {
    mysql.init('127.0.0.1', 3306, 'test', null, 'pw123456');
    DbUtil.getCreateSql(AppTbs.assets, sql => mysql.createTable(sql));
    DbUtil.getCreateSql(AppTbs.draw, sql => mysql.createTable(sql));
    DbUtil.getCreateSql(AppTbs.els, sql => mysql.createTable(sql));
}, null, (req, res, p) => {
    if ('/upload_asset.do' === p.pathname) {
        // 覆盖OPTIONS请求必须有的请求头
        res.setHeader("Access-Control-Allow-Headers", "content-type,x-requested-with");
    }
});


/** 设备图片上传 */
App.route("/upload_asset.do", (req, res, params) => {
    // 按照表中设置的数据类型转换参数中的值
    DbUtil.transDataType(params, AppTbs.assets);
    params.id = App.gsId();
    // 将数据记录到数据库中
    App.validator({ code: { required: true }, name: { required: true }, file: { required: true }, firstFile: { requested: true } }, params, f => {
        if (f) {
            mysql.insertRowData(DbUtil.buildInsertSql(AppTbs.assets), [
                params.id, params.code, params.name, params.voltage, params.current, params.power, params.firstFile.fileName
            ], () => {
                App.responseOk(res, '插入成功');
            })
        }
    })
});

/** 获取设备列表 */
App.route("/list_asset.do", (req, res, ps) => {
    const tb = AppTbs.assets;
    mysql.queryData(`select * from ${tb.n}`, d => App.responseData(res, d), e => App.responseError(res))
})

/**
 * 保存绘图的数据字符串
 */
App.route("/save_draw.do", (req, res, ps) => {
    DbUtil.transDataType(ps, AppTbs.draw);
    ps.id = App.gsId();
    App.validator({ content: { required: true } }, ps, f => {
        if (f) {
            mysql.insertRowData(DbUtil.buildInsertSql(AppTbs.draw), [
                ps.id, ps.content
            ], () => {
                App.responseOk(res, '插入成功');
            })
        }
    })
})
/**
 * 获取绘图的字符串的列表
 */
App.route("/list_draw.do", (req, res, ps) => {
    const tb = AppTbs.draw;
    mysql.queryData(`select * from ${tb.n}`, d => App.responseData(res, d), e => App.responseError(res))
})

/**
 * 保存当前绘制的一个对象
 */
App.route("/saves.do", (req, res, ps) => {
    DbUtil.transDataType(ps, AppTbs.els);
    ps.id = App.gsId();
    ps.tmpId = 1;// 先定义模板默认为1，不是1的就不是默认模板
    App.validator({
        id: { required: true }, type: { required: true }, prop: { required: true }, astId: { required: true },
        x: { required: true }, y: { required: true }, w: { required: true }, h: { required: true }, r: { required: true }
    }, ps, f => {
        if (f) {
            App.validator({ content: { required: true } }, ps, f => {
                if (f) {
                    mysql.insertRowDataAuto(
                        AppTbs.els,
                        ['id', 'type', 'prop', 'astId', 'x', 'y', 'w', 'h', 'r', 'tmpId'],
                        ps, () => {
                            App.responseOk(res, '插入成功');
                        }
                    )
                }
            })
        }
    })
})

/**
 * 获取绘制的一张图的数据
 */
App.route('/getTempate.do', (req, res, ps)=>{
    mysql.queryData(`select * from ${AppTbs.els}`, rows => {
        App.responseData(res, rows);
    })
})

/**
 * 删除当前绘制的对象
 */
App.route('/delete_el.do', (req, res, ps)=>{
    App.reqDataFormat(ps, {id:'number'});
    App.validator({id: {required: true}},ps, (b, msg)=>{
        if(b) {
            mysql.executeSql(`delete form ${AppTbs.els.n} where id=${ps.id}`, ()=>{
                App.responseEmpty(res);
            })
        } else {
            App.responseWarning(res, msg);
        }
    })
})



