// 数据类型定义（数据库类型对应js数据类型转换）
const string = 'string';
const boolean = 'boolean';
const float = 'number';
const int = 'number';
const long = 'number';
const double = 'number';

//表： 设备数据
exports.assets = {
    n: 'assets',
    c: {
        id: { type: int, sqlType: 'INT NOT NULL PRIMARY KEY' },
        code: {type: string, sqlType: 'VARCHAR(255) NOT NULL'},
        name: {type: string, sqlType: 'VARCHAR(255) NOT NULL'},
        voltage: { type: int, sqlType: 'INT' },
        current: { type: int, sqlType: 'INT' },
        power: { type: int, sqlType: 'INT' },
        photo: { type: string, sqlType: 'VARCHAR(255) NOT NULL' },
    },
    fk: []
}

//表： 绘图结果表
exports.draw = {
    n: 'draw',
    c: {
        id: { type: int, sqlType: 'INT NOT NULL PRIMARY KEY' },
        content: { type: string, sqlType: 'TEXT' },
    },
    fk: []
}

/**
 * 绘图数据表，对应canvas画板的数据的类型的存数，主要是用于绘图的信息的存储
 * 1） 类型的保存（主要是：text，img）
 * 2） 设备属性记录 astProp
 * 3） 设备编号记录 astId
 * 4） 位置x
 * 5） 位置y
 * 6） 宽度w
 * 7） 高如h
 * 8） 旋转角度r
 * 9)  模板编号（主要是对设备定制多个版图）
 */
exports.els = {
    n: 'els',
    c: {
        id: { type: int, sqlType: 'INT NOT NULL PRIMARY KEY' },
        type: {type: string, sqlType: 'VARCHAR(255) NOT NULL'},
        prop: {type: string, sqlType: 'VARCHAR(255) NOT NULL'},
        astId: {type: int, sqlType: 'INT NOT NULL'},
        x: {type: int, sqlType: 'INT NOT NULL'},
        y: {type: int, sqlType: 'INT NOT NULL'},
        w: {type: int, sqlType: 'INT NOT NULL'},
        h: {type: int, sqlType: 'INT NOT NULL'},
        r: {type: double, sqlType: 'DOUBLE NOT NULL'},
        tmpId: {type: int, sqlType: 'INT NOT NULL'},
    },
    fk: [{k: 'astId',fb: 'assets',fk: 'id'}]
}