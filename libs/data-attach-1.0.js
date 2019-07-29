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

function fabricFilter () {

}