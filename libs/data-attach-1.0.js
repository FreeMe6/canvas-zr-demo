/*
 * 实现Fabric的封装处理
 *
 *   在实际的使用中，总会有各种不如意，为了简化开发，需要对部分的功能进行封装使用
 *
 *   1） 解决附加属性不序列化的问题
 *
 *
 * @type {{}}
 */

const FabricDs = new Map();

// 测点编号指定key
const FabricPointCode = '_point_relate_code';


/**
 * 根据id创建Fabric画板
 * @param id
 * @returns {*}
 */
function newFabricCanvas(id) {
    return new fabric.Canvas('canvas')
}


/**
 * 在el上附加属性，属性需要在map中添加
 *
 * @param el 需要附加的对象
 * @param map new Map() 属性map组
 */
function fabricAttchToObject (el, map) {
    const attach = {};
    for (let [k, v] of map.entries()){
        attach[k] = v
    }
    el.toObject =(function(toObject) {
        return function(){
            return fabric.util.object.extend(toObject.call(this),attach)
        };
    })(el.toObject);
}


/**
 * 重新渲染
 * @param canvas
 */
function fabricRenderAll(canvas) {
    canvas.renderAll();
}

/**
 * 进行序列化，返回序列化之后的json对象
 * @param canvas
 * @returns {string}
 */
function toSerializable (canvas) {
    return JSON.stringify(canvas.toJSON())
}

/**
 * 从序列化数据中重建引导信息
 * @param canvas
 * @param fetch
 */
function fromSerializable (canvas, fetch) {
    canvas.clear();
    // let points = [];
    // let data = JSON.parse(fetch);
    // for(let obj of data.objects) {
    //     if(obj[FabricPointCode]){
    //         // 只记录测点数据
    //         points.push(obj[FabricPointCode]);
    //         fabricSet(obj[FabricPointCode], null)
    //     }
    // }
    canvas.loadFromJSON(fetch);
}

/**
 * 获取测点Fabric对象
 * @param pointerId
 * @param fsize
 */
function fabricPointText(text, pointerId, fsize) {
    return new PointText(text, pointerId, {
        fontSize: fsize
    });
}


/**
 * 获取测点图片Fabric对象（测点可以是图片，比如运行状态用图片表示）
 * @param url 图片的地址
 * @param pointerId 如果不是则直接写null或undefined
 * @param scale 图片缩放比例
 * @param callback 通过回调返回对象
 */
function fabricPointImg(url, pointerId, scale, callback) {
    fabric.Image.fromURL(url, function (_) {
        _.scale(scale).set({top: 100, left: 100});
        if (pointerId) {
            fabricAttchToObject(_, new Map([['pointId', pointerId]]));
        }
        callback(_)
    });
}

/**
 * 存储数据在Fabric数据源，新增|更新就是这个方法
 * @param strKey
 * @param objValue
 */
function fabricSet(strKey, objValue) {
    FabricDs.set(strKey, objValue);
}

/**
 * 获取存储在Fabric数据源中的数据
 * @param strKey
 */
function fabricGet(strKey) {
    FabricDs.get(strKey)
}

/**
 * 删除存储在Fabric数据源中的数据
 * @param strKey
 */
function fabricRemove(strKey) {
    FabricDs.delete(strKey)
}


// 考虑到一个问题：就是扩展一下比较好，因为这样我们可能添加更为丰富的属性，否则受限制于其本身。
var LabeledRect = fabric.util.createClass(fabric.Rect, {

    type: 'labeledRect',

    initialize: function(options) {
        options || (options = { });

        this.callSuper('initialize', options);
        this.set('label', options.label || '');
    },

    toObject: function() {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            label: this.get('label')
        });
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);

        ctx.font = '20px Helvetica';
        ctx.fillStyle = '#333';
        ctx.fillText(this.label, -this.width/2, -this.height/2 + 20);
    }
});

/**
 * 自己定义一个对象来进行我们的功能的实现可能更好
 * @type {klass}
 */
const PointText = fabric.util.createClass(fabric.Text, {
    // 都有的
    type: 'pointText',

    initialize: function(text, id, options) {
        options || (options = { });

        this.callSuper('initialize', text || 'TEXT', options);
        this.set('id', id || '');
    },

    /**
     * 用于提供给序列化的
     * @returns {Object}
     */
    toObject: function() {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            id: this.get('id')
        });
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);
    }
});




