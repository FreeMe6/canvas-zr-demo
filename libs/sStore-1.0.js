/**
 * 获取key映射的json数据
 * @param strKey
 * @returns {string}
 */
function getK(strKey) {
    return sessionStorage.getItem(strKey)
}

/**
 * 写json格式数据
 * @param strKey key
 * @param json  val
 */
function set(strKey, json) {
    sessionStorage.setItem(strKey, json)
}

/**
 * 检查数据是否存在
 * @param strKey
 * @returns {boolean}
 */
function contain(strKey) {
    return !!sessionStorage.getItem(strKey)
}

/**
 * 清理所有数据
 */
function clearAll() {
    sessionStorage.clear()
}

/**
 * 删除指定key对应的数据
 * @param strKey
 */
function del(strKey) {
    sessionStorage.removeItem(strKey)
}