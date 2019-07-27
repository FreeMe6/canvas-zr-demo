const mysql = require('mysql');

function initClient(host, port, db, u, p) {
    if (!db || db == '') {
        new Error('connect db not allow empty !');
        return;
    }
    client = mysql.createConnection({
        host: host || '127.0.0.1',
        user: u || 'root',
        password: p || 'root',
        port: port || '3306',
        database: db || 'notesr',
    });
    client.connect();
    mysql.client = client;
}

/**
 * 初始化mysql连接客户端
 * @param host 连接的IP，默认本地 127.0.0.1
 * @param port 连接的端口，默认 3306
 * @param db 连接的数据库
 * @param u 用户名 默认root
 * @param p 密码 默认root
 * @since 1.0
 */
exports.init = function (host, port, db, u, p) {
    try{
        initClient(host, port, db, u, p);
    } catch (error) {
        console.log('数据库连接失败', error);
    }
}

/**
 * 根据sql创建表
 * 
 * @param sql 执行的sql
 * @since 1.0
 */
exports.createTable = function (sql) {
    console.log(`SQL::[${sql}]`);
    mysql.client.query(sql, (err, rel) => {
        if (err) console.log(err);
        console.log(rel);
    })
}

/**
 * 查询数据
 * 
 * @param sql 执行的sql
 * @param error [可选] 发生错误的回调
 * @param done [可选] 执行完毕的回调，返回处理的结果
 * @since 1.0
 */
exports.queryData = function (sql, done, error) {
    console.log(`SQL::[${sql}]`);
    mysql.client.query(sql, (err, rel) => {
        if (err) {
            console.error(err);
            if (error) error(err);
        }
        if (done) done(rel);
    })
}
function insertRow(sql, row, done) {
    // 要处理的两个问题：
    // 1）将sql中的 `(?,?,?,?..,?)` 替换成参数
    // 2) 完成数据的类型鉴别，然后写入数据


    let paramStr = ``;
    const size = row.length;
    for (let i = 0; i < size; i++) {
        const dataType = typeof row[i];
        if ('string' === dataType) {
            paramStr = (i + 1) === size ? `${paramStr}'${row[i]}'` : `${paramStr}'${row[i]}', `;
        } else {
            if (undefined === row[i]) {
                row[i] === null;
            }
            if (dataType === 'function') {
                return;
            }
            paramStr = (i + 1) === size ? `${paramStr}${row[i]}` : `${paramStr}${row[i]},`;
        }
    }

    // 针对（?,?,..）的正则
    const reg = /(\?.*\?)/ig;
    sql = sql.replace(reg, paramStr);
    console.log(`SQL::[${sql}]`);
    mysql.client.query(sql, (err, rel) => {
        if (err) {
            console.error(err);
        }
        if (done) done(rel);
    })
}
/**
 * 插入一条数据记录
 * 
 * @param sql 执行的sql
 * @param row 行数据对象，将自动在里面获取数据并填充到sql中
 * @param done [可选] 执行完毕的回调，返回处理的结果
 * @since 1.0
 */
exports.insertRowData = function (sql, row, done) {
    insertRow(sql, row, done)
}


/**
 * 插入一条数据记录，采用不一样的方式，此种方式完全自动填入对应数据，不需要手写参数指定
 * @param tb 表对象实例
 * @param cs 需要插入的字段，如果是所有的，你大可使用 Object.keys(AppTbs.xx.c) 来获取
 * @param ps 参数对象，将自动的在里面取对应字段的值，如果没有则用null，并且给出提示
 * @param done [可选] 执行完毕的回调，返回处理的结果
 * @since 2.0
 */
exports.insertRowDataAuto = function (tb, cs, ps, done) {
    let paramStr = ``;
    // 根据类型来自动取需要的属性值
    const size = cs.length;
    try {
        for (let i = 0; i < size; i++) {
            const v = ps[row[i]];
            if (v === undefined) {
                new Error(`warning !!! \n param[${row[i]}] is undefined!!!`);
            }
            const dataType = typeof v;
            if ('string' === dataType) {
                paramStr = (i + 1) === size ? `${paramStr}'${v}'` : `${paramStr}'${v}', `;
            } else {
                if (undefined === row[i]) {
                    row[i] === null;
                }
                if (dataType === 'function') {
                    new Error(`warning !!! \n param[${row[i]}] typeof is function!!!`);
                }
                paramStr = (i + 1) === size ? `${paramStr}${v}` : `${paramStr}${v},`;
            }
        }
    } catch (e) {
        console.log(e)
        if (done) done(null);
        return;
    }
    
    let sql = `insert into ${tb.n} (${cs.toString()}) values(${paramStr})`
    console.log(`SQL::[${sql}]`);
    mysql.client.query(sql, (err, rel) => {
        if (err) {
            console.error(err);
        }
        if (done) done(rel);
    })
}

/**
 * 批量插入操作
 * 
 * @param sql 执行的sql
 * @param objects 多行数据：[[x,x,x,x,...],[x,x,x,...],...]
 * @param done [可选] 执行完毕的回调，返回处理的结果
 * @since 1.0
 */
exports.insertData = function (sql, objects, done) {
    //插入多条数据
    for (let row of objects) {
        insertRow(sql, row, null);
    }
    if (done) done();
}

/**
 * 执行sql命令，并可返回数据
 * @param sql 执行的sql
 * @param done [可选] 执行完毕的回调，返回处理的结果
 * @param error [可选] 发生错误的回调
 * @since 1.0
 */
exports.executeSql = function (sql, done, error) {
    console.log(`SQL::[${sql}]`);
    mysql.client.query(sql, (err, rel) => {
        if (err) {
            console.error(err);
            if (error) error(err);
        }
        if (done) done(rel);
    })
}

