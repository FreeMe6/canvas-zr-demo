const WebSocket = require('ws');

/**
 * 初始化ws客户端连接
 * @param port 默认是3030
 * @param name 自定义客户端名称（主要作为客户端识别信息的描述信息）
 */
exports.start = function (name="cli", port=3030) {
  // 启动之初，创建客户端的tk号，作为服务识别客户端的请求的识别码
  const code = parseInt(new Date().getTime() / 1000 - 1563414027);
  WebSocket.cli_code = 'sn' + code;
  WebSocket.cli_name = name === 'cli' ? name + code : name;
  WebSocket.___ws = new WebSocket('ws://127.0.0.1:'+port);

  WebSocket.___ws.on('open', () => {
    // 先发送启动信号
    let msg = {type: 'start', cli_code: WebSocket.cli_code, cli_name: WebSocket.cli_name}
    WebSocket.___ws.send(JSON.stringify(msg));

    // 定时发送心跳信号
    setInterval(function () {
      WebSocket.___ws.send(JSON.stringify({type: 'ping', cli_code:WebSocket.cli_code}))
    },3000)

    if (WebSocket.readyHandler) {
      WebSocket.readyHandler();
    }
  });

  WebSocket.___ws.on('error', err => {
    console.log(err)
  });

  WebSocket.___ws.on('message', data => {
    // 处理接收的消息
    if (data.message === 'pang') {
      if (WebSocket.heartBeatEvent){
        WebSocket.heartBeatEvent(data)
      }
    } else {
      if(WebSocket.res) {
        WebSocket.res(data)
      }
    }
  });

  WebSocket.___ws.on('close', (code, reason) => {
    console.log(code, reason);
  })
};

/**
 * 客户端初始化完毕事件
 * @param c
 */
exports.ready = function (c) {
  if(c)
    WebSocket.readyHandler = c;
}

/**
 * 心跳事件
 *
 * 如果你打算使用心跳干点什么，你可以调用这个函数，并绑定你需要做的事情
 *
 * @param callback
 */
exports.beatEvent = function (callback) {
  if (callback) {
    WebSocket.heartBeatEvent = callback
  }
};

/**
 * Json 数据服务(使用数据服务)
 * @param service 使用的服务名称
 * @param data 消息数据对象 比如 {} 空对象
 * @param done 消息发送成功的回响
 */
exports.jsonDataService = function (service, data, done) {
  WebSocket.___ws.send(JSON.stringify({type: 'data_service', service: service, data: data, cli_code:WebSocket.cli_code}));
  WebSocket.res = done
};

/**
 * 发送消息(使用数据服务)
 * @param service 使用的服务名称 'xxxx'
 * @param blob 数据
 * @param done 消息发送成功的回响 function (jsonRel)
 */
exports.blobPush = function (service, blob, done) {
  WebSocket.___ws.send(blob);
  WebSocket.res = done
}