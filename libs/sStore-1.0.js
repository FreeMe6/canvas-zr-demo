/**
 * 获取key映射的json数据
 * @param strKey
 * @returns {string}
 */
function getK(strKey) {
    return sessionStorage.getItem(strKey)
}

/**
 * 获取保存的数据
 * @param strKey
 * @param callback
 */
function getK(strKey, callback) {
    if (localforage) {
        localforage.getItem(strKey).then(callback)
    } else {
        console.error('需要localforage库支持！')
    }
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
 * 写数据
 * @param strKey
 * @param data
 * @param callback
 */
function setK(strKey, data, callback) {
    if (localforage) {
        localforage.setItem(strKey, data).then(callback)
    } else {
        console.error('需要localforage库支持！')
    }
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
 * 检查数据是否存在
 * @param strKey
 * @param callback
 */
function contain(strKey, callback) {
    getK(strKey, function (d) {
        callback(!!d)
    })
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

/**
 * 针对有些情况下使用map缓存数据更好
 * @type {{_map: Map<any, any>, set(*=, *=): void, contain(*=, *): void, get(*=, *): void, delte(*=): void}}
 */
const mapStore = {
    _map: new Map(),
    set(k, v) {
        this._map.set(k, v);
    },
    get(k) {
        return this._map.get(k)
    },
    get(k, c) {
        c(this._map.get(k))
    },
    contain(k) {
        return !!this._map.get(k)
    },
    contain(k, c) {
        c(!!this._map.get(k))
    },
    delte(k) {
        this._map.delete(k)
    },
    clearAll() {
        this._map.clear()
    }
};