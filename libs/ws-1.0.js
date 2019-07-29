/**
 * 定义一个ws的客户端连接js
 * @type {{ws: undefined, connect(*=, *=): void}}
 */
const WS10 = {
  ws: undefined,
  cli_code: undefined,
  cli_name: undefined,
  /**
   * 建立连接
   * @param name 客户端自定义名称
   * @param host 连接服务器
   * @param port 连接端口
   */
  connect (name, host, port) {
    host = host || '127.0.0.1';
    port = port || 3030;
    const _$ = this;
    _$.ws = new WebSocket(`ws://${host}:${port}`);
    const code = parseInt(new Date().getTime() / 1000 - 1563414027);
    _$.cli_code = 'sn' + code;
    _$.cli_name = !!name ? 'cli'+ name + code : name;
    const regData = {type: 'start', cli_code: _$.cli_code, cli_name:  _$.cli_name}

    _$.ws.onopen = function(){
      console.log(`connected : ws://${host}:${port}`);
      _$.ws.send(JSON.stringify(regData));

      // 定时发送心跳信号
      setInterval(function () {
        try{
          _$.ws.send(JSON.stringify({type: 'ping', cli_code:_$.cli_code}))
        } catch (e) {
        }
      },1000);

      if ( _$.ws.readyHandler) {
        _$.ws.readyHandler(_$);
      }
    };

    _$.ws.onmessage = function(ev){
      let data = JSON.parse(ev.data)

      if (data.msg === 'pang') {
        if (_$.ws.heartBeatEvent)
          _$.ws.heartBeatEvent(data)
      } else {
        if(_$.ws.res) {
          _$.ws.res(data);
        }
      }
    };

    _$.ws.onclose = function(ev){
      console.log('已断开服务连接', ev)
    };

    _$.ws.onerror = function(ev){
      console.log(ev);
      console.error('错误', ev)
    };
    return this;
  },
  /**
   * 服务连接准备好之后事件
   * @param c
   */
  ready(c) {
    this.ws.readyHandler = c;
    return this;
  },
  /**
   * 使用服务
   * @param service
   * @param data
   * @param done
   */
  jsonDataService (service, data, done) {
    const _$ = this;
    _$.ws.send(JSON.stringify({type: 'data_service', service: service, data: data, cli_code: _$.cli_code}));
    _$.ws.res = done
    return this;
  },
  /**
   * 心跳
   * @param c
   */
  heartBeat(c) {
    this.ws.heartBeatEvent=c;
    return this;
  }
};

