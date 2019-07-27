$.ajaxSetup({cache: false});
/*
 * import {jsonGetData, jsonPostData, jsonPostData, jsonPostLocalData} from 'ajax.js'
 *
 */

 /**
  * 传入请求的结果，从结果中获取请求的状态，然后返回通用的提示
  * @param {*} data 
  */
function getCommonReqMessage(data) {
    if (!data.msg) {
        return data.state === 'success' ? '执行成功'
            : data.state === 'warning' ? '执行发生异常情况'
                : data.state === 'error' ? '执行失败'
                    : '未知结果';
    }

    return Array.isArray(data.msg) ? data.msg.toString() : data.msg;
}

/** 将参数换行展示到textarea */
function formatArrayByCR (param, arr) {
    for (let v of arr) {
        param += v + "\n";
    }
}

/**
 *
 * @param {*} url
 * @param {*} params
 * @param {*} callback
 */
function jsonGetData(url, params, callback) {
    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        data: params,
        success: function (data) {
            console.debug(data);
            callback(data);
        },
        error: function (e) {
            if (e) console.log(e);
        }
    });
}

/**
 *
 * @param {*} url
 * @param {*} params
 * @param {*} callback
 */
function jsonPostData(url, params, callback) {
    $.ajax({
        url: url,
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(params),
        success: function (data) {
            console.debug(data);
            callback(data);
        },
        error: function (e) {
            if (e) console.log(e);
        }
    });
}

/**
 * 将本地文件中的请求，转发成localhost的请求
 *
 * @param url
 * @param port
 * @returns {string}
 */
function localUrl(url, port) {
    port = port ? ':' + port : '';
    return `http://localhost${port}${url}`
}

/**
 * 基本本地文件的模拟请求
 * @param url
 * @param params
 * @param callback
 * @param conf 配置项
 * {
 *      port: 本地模拟的请求的端口
 * }
 */
function jsonGetLocalData(url, params, callback, conf) {
   jsonGetData(localUrl(url, conf.port), params,callback);
}
/**
 * 基本本地文件的模拟请求
 * @param url
 * @param params
 * @param callback
 * @param conf 配置项
 * {
 *      port: 本地模拟的请求的端口
 * }
 */
function jsonPostLocalData(url, params, callback, conf) {
    jsonPostData(localUrl(url, conf.port), params,callback);
}


function jsonPostMutiptData(url, params, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open("post", url, true);
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
    xhr.setRequestHeader('Accept-Language', 'zh-CN,zh;q=0.9');

    // xhr.addEventListener('loadstart', handleEvent);
    // xhr.addEventListener('load', handleEvent);
    // xhr.addEventListener('loadend', handleEvent);
    // xhr.addEventListener('progress', handleEvent);
    xhr.addEventListener('error', e => {
        console.error(e);
    });
    // xhr.addEventListener('abort', handleEvent);

    xhr.addEventListener('load', function (e) {
        try {
            const json = eval('('+e.target.response+')');
            if (callback) callback(json);
        } catch (e) {
            console.error(e);
        }
    })

    xhr.send(params);
}

/**
 * 上传文件
 * 采用formData来模拟form表单然后通过xhr发送出去
 * 返回值为json格式数据
 * @param {*} url 
 * @param {*} params 
 * @param {*} callback 
 * @param {*} conf 
 */
function jsonPostLocalMutiptData (url, params, callback, conf) {
    jsonPostMutiptData(localUrl(url, conf.port), params, callback);
}

/**
 * 获取返回结果中的数据
 * @param d
 * @returns {*}
 */
function getRows(d) {
    return d.data && d.data.length > 0 ? d.data : [];
}

/**
 * 获取返回一条结果的数据
 * @param d
 * @returns {undefined}
 */
function getRow(d) {
    return d.data && d.data.length > 0 ? d.data[0] : undefined;
}

/**
 * 获取数字 Id
 * @returns {number}
 */
function glId () {
    const date = new Date();
    return parseInt(`${date.getFullYear()}${(date.getMonth() + 1)}${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}`);
};

/**
 * 获取短数字 id
 */
function gsId () {
    const date = new Date();
    return  parseInt(date.getTime()/1000 - 1563414027);
}