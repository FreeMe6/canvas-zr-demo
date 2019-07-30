/**
 * 定义一个ws的客户端连接js
 * @type {{ws: undefined, connect(*=, *=): void}}
 */
const WS10 = {
    ws: undefined,
    rh: undefined,
    cli_code: undefined,
    cli_name: undefined,
    /**
     * 建立连接
     * @param name 客户端自定义名称
     * @param host 连接服务器
     * @param port 连接端口
     */
    connect(name, host, port) {
        host = host || '127.0.0.1';
        port = port || 3030;
        const code = parseInt(new Date().getTime() / 1000 - 1563414027);

        const _$ = this;
        _$.cli_code = 'sn' + code;
        _$.cli_name = !!name ? 'cli' + name + code : name;


        _$.ws = new WebSocket(`ws://${host}:${port}`);
        _$.ws.pools = new Map();

        // 打开服务连接
        _$.ws.onopen = function () {
            console.log(`connected : ws://${host}:${port}`);

            // 发送注册信息
            _$.ws.send(JSON.stringify({type: 'start', sid: '_1', cli_code: _$.cli_code, cli_name: _$.cli_name}));
        };

        // 消息接受处理
        _$.ws.onmessage = function (ev) {
            // 如果获取数据？
            ev = JSON.parse(ev.data);
            let fc = undefined;
            if (ev.sid) {
                fc = _$.ws.pools.get(ev.sid);
                switch (ev.state) {
                    case 'init':
                        //调用加载完成ready事件
                        if (_$.ws.rh) _$.ws.rh(_$);
                        _$.jsonDataService('readServiceList', null, d => console.log('服务列表', d))
                        break;
                    case 'success':
                        if (fc) fc(typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data);
                        break;
                    case 'warning':
                    case 'error':
                        if (fc) fc(typeof ev.msg === 'string' ? JSON.parse(ev.msg) : ev.msg);
                        break;
                    default:
                        break;
                }
            }
        };

        // 服务器断开连接
        _$.ws.onclose = function (ev) {
            console.log('已断开服务连接', ev)
        };

        // 服务器错误
        _$.ws.onerror = function (ev) {
            console.log(ev);
            console.error('错误', ev)
        };
        return this;
    },

    ready(c) {
        this.ws.rh = c;
        return this;
    },

    /**
     * 请求ws的服务
     * @param service 具体服务编号
     * @param data 请求数据
     * @param done 完成时的回调函数（返回数据）
     */
    jsonDataService(service, data, done) {
        const _$ = this;
        const k = uuid();
        _$.ws.send(JSON.stringify({sid: k, type: 'data_service', service: service, data: data, cli_code: _$.cli_code}));
        _$.ws.pools.set(k, done);
        return this;
    }
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
