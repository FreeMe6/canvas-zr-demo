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
    WebSocket.___ws.pools = new Map();
  });

  WebSocket.___ws.on('error', err => {
    console.log(err)
  });

  WebSocket.___ws.on('message', data => {
    let fc = undefined;
    if (data.sid) {
      fc = WebSocket.___ws.pools.get(data.sid);
      switch (data.state) {
        case 'init':
          //调用加载完成ready事件
          if (WebSocket.rh) WebSocket.rh(WebSocket);
          break;
        case 'success':
          if (fc) fc(typeof data.data === 'string' ? JSON.parse(data.data) : data.data);
          break;
        case 'warning':
        case 'error':
          if (fc) fc(typeof data.msg === 'string' ? JSON.parse(data.msg) : data.msg);
          break;
        default:
          break;
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
    WebSocket.rh = c;
}

/**
 * Json 数据服务(使用数据服务)
 * @param service 使用的服务名称
 * @param data 消息数据对象 比如 {} 空对象
 * @param done 消息发送成功的回响
 */
exports.jsonDataService = function (service, data, done) {
  const k = uuid();
  WebSocket.___ws.send(JSON.stringify({sid: k, type: 'data_service', service: service, data: data, cli_code:WebSocket.cli_code}));
  WebSocket.___ws.pools.set(k, done);
};

function uuid() {
  const s = [];
  const hexDigits = "0123456789abcdef";
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";
  return s.join("");
}