/**
 * 将表中的字段名，转成字符串，使用逗号分隔
 * @param {*} c 表中字段属性定义对象比如 x.sys_user.c
 */
exports.columns2str = function (c) {
    return Object.keys(c).toString();
}

/**
 * 获取创建表的sql语句，用于进行表的创建
 * @param {*} b 表，比如 tb.classify ,主要是使用表中的参数的js类型
 * @param {*} callback 返回组织好的sql语句
 */
exports.getCreateSql = function (b, callback) {
    if (!callback) {
        new Error("no operate to do, you need to add operate function for create table");
        return;
    }
    let fds = Object.keys(b.c), arr = [], sql = null;

    fds.forEach(key => {
        arr.push(`${key} ${b.c[key].sqlType}`);
    });

    let fkStr = ''
    if (b.fk && b.fk.length > 0) {
        for(let r of b.fk) {
            fkStr = fkStr + `, CONSTRAINT ${r.n ? r.n : 'FK_'+b.n.toUpperCase()+'_VAR'} FOREIGN KEY(${r.k}) REFERENCES ${r.fb}(${r.fk})`
        }
    }

    sql = `create table if not exists ${b.n}(${arr.toString()}${fkStr});`;
    callback(sql);
}

/**
 * 转换参数中的类型不匹配的为匹配的类型
 * 异常的类型，默认转成null
 * @param ps 参数对象
 * @param b 定义的表对象，比如 x.sys_user
 */
exports.transDataType = function (ps,b) {
    let fds = Object.keys(b.c);
    fds.forEach(key => {
        if (ps[key]) {
            switch(b.c[key].type) {
                case 'number': {
                    ps[key] = Number(ps[key]);
                    break;
                }
                case 'string': {
                    ps[key] = String(ps[key]);
                    break;
                }
                case 'boolean': {
                    ps[key] = Boolean(ps[key]);
                    break;
                }
            }
        } else {
            ps[key] = null;
        }
    });
}

/**
 * 返回构建的sql语句
 * @param {*} b 定义的表对象，比如 x.sys_user
 */
exports.buildInsertSql = function (b) {
    let str = '';
    for(let i=1;i<Object.keys(b.c).length;i++) {
        str = `${str},?`;
    }
    return `insert into ${b.n}(${exports.columns2str(b.c)}) values(?${str})`;
}

/**
 * 获取数字 Id
 * @returns {number}
 */
exports.glId = () => {
    const date = new Date();
    return parseInt(`${date.getFullYear()}${(date.getMonth() + 1)}${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}`);
};

/**
 * 获取短数字 id
 */
exports.gsId = () => {
    const date = new Date();
    return  parseInt(date.getTime()/1000 - 1563414027);
}