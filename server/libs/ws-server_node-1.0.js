const _md_ws = require('ws');
const _cc = {};
const _ss = new Map();
const _ssdesc = new Map();

/**
 * 启动WS服务
 * @param port 服务端口，不传默认是3030端口
 */
exports.start = function (port) {
  new _md_ws.Server(
      {port: port || 3030}
  ).on('connection', ws => {
    // 消息事件
    ws.on('message', msg => {
      function sms() {
        // 其他的情况直接广播消息
        ws.clients.forEach(function each(client) {
          client.send({state: 'success', data: msg, ts: new Date().getTime()});
        });
      }

      function err (m) {
        _cc[msg.cli_code].send(JSON.stringify({state: 'error', msg: m, ts: new Date().getTime()}));
      }


      if (typeof msg === 'string') {
        msg = JSON.parse(msg);
        if (msg.type === 'start') {
          ws.cli_code = msg.cli_code;
          _cc[msg.cli_code] = ws;
          if (!!_cc[msg.cli_code]){
            _cc[msg.cli_code].send(JSON.stringify({
              state: 'success',
              msg: 'connect success ! I am server at 3030 port .',
              ts: new Date().getTime()
            }));

            console.log('client connect', {name: msg.cli_name});
          }
        } else if (msg.type === 'ping') {
          if (!!_cc[msg.cli_code]) {
            _cc[msg.cli_code].send(JSON.stringify({state: 'success', msg: 'pang', ts: new Date().getTime()}))
          }
        } else if (msg.type === 'data_service') {
          if (!!_cc[msg.cli_code]) {
            const fc = _ss.get(msg.service);
            if (fc) {
              _cc[msg.cli_code].send(JSON.stringify({state: 'success', data: fc(msg.data, msg), ts: new Date().getTime()}));
            } else {
              err('handler not empty !');
            }
          }
        } else {
          sms()
        }
      } else {
        // 非json数据
        sms()
      }
    });
    ws.on('close', function() {
      console.log('Client disconnected.');
      // 删除关闭的客户端
      delete _cc[ws.cli_code];
    });
    ws.on('error', function() {
      delete _cc[ws.cli_code];
    });
  })
};

/**
 * 添加服务，服务函数要求必须传回返回值，入参可选
 * @param name 服务名称
 * @param desc 服务描述信息，默认不传则为空
 * @param callback 服务函数，服务函数要求必须传回返回值，入参可选 callback(data, requestFullData)
 */
exports.addService = function (name, desc, callback) {
  _ss.set(name, callback);
  _ssdesc.set(name, desc);
};

/**
 * 获取客户端连接注册表
 */
exports.getClientRegister = function () {
  return _cc;
};

/**
 * 获取支持的服务列表
 * 注意，需要等待服务完全启动起来之后才能获取完整的服务列表，否则可能无返回数据或者返回数据不完整
 * @returns {*}
 */
exports.getServiceList = function () {
  const sss = {};
  for(let [k,v] of _ss.entries()) {
    sss[k] = {
      name: v,
      desc: _ssdesc.get(k)
    }
  }
  return sss;
};