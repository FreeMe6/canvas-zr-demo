/*
 * NodeJs 后端服务器封装
 * 
 * node库安装
 * 1） npm install http url formidable fs path mysql --save
 * 2） cnpm install http url formidable fs path mysql --save
 *
 * const App = require('./util/http.js');
 * 
 * 使用App工具添加请求的路由和业务处理逻辑即可
 * App.route(url, deal)
 * App.gId() # 返回以当前时间的年月日时分秒拼接而成的数字id，数据类型必须long型
 * 
 * 使用数据库的表的工具
 * AppTbs.utl.createTable(which, sql=>{})
 * 
 * 使用缓存工具
 * App.cacheAdd(k,v);
 * v = App.cacheGet(k);
 * f = App.cacheContain(k);
 * App.cacheRemove(k);
 * 
 * 注意事项，我将上传的文件放在了 requets.extpars 扩展属性中了，如果需要获取本次上传的文件
 * 需要到这个里面去取，key就是你上传的时候用的什么key就是什么；
 */

const _http_ = require('http')
    , _url_ = require('url')
    , _formidable = require('formidable')
    , _fs = require('fs')
    // , _util = require('util')
    , path = require('path');

const __S = {
  actions: new Map(),
  cachePool: new Map()
};

/**
 * 从map缓存中添加
 */
exports.cacheAdd = function cacheAdd(key, value) {
  console.debug('add cache of key[' + key + ']');
  __S.cachePool.set("" + key, value);
};

/**
 * 从map缓存中获取
 */
exports.cacheGet = function cacheGet(key) {
  console.debug('load cache of key[' + key + ']');
  return __S.cachePool.get("" + key);
};

/**
 * 从map缓存中删除
 */
exports.cacheRemove = function cacheRemove(key) {
  if (__S.cachePool.has("" + key)) {
    console.debug('remove cache of key[' + key + ']');
    __S.cachePool.delete("" + key);
  }
};

/**
 * 从map缓存中检查，是否包含
 */
exports.cacheContain = function (key) {
  return __S.cachePool.has("" + key);
};

// 规则参数列表，目前仅仅支持者几个校验规则
const ruleParams = {required: 'required', max: 'max', min: 'min', message: 'message', validator: 'validator'};

/**
 * 返回错误信息 {msg: ?, state: 'error', ot: ''}
 */
exports.responseError = function (res, msg, ot) {
  res.writeHead(200, {"Content-Type": "application/json;charset=utf-8"});
  // res.statusCode = 200;
  res.end(JSON.stringify({
    state: 'error',
    msg: msg,
    ot: ot
  }));
};

/**
 * 返回警告信息 {msg: ?, state: 'warning', ot: '', ts: ''}
 * @param res
 * @param msg
 * @param ot
 */
exports.responseWarning = function (res, msg, ot) {
  res.writeHead(200, {"Content-Type": "application/json;charset=utf-8"});
  // res.statusCode = 200;
  res.end(JSON.stringify({
    state: 'warning',
    msg: msg,
    ot: ot,
    ts: new Date().getTime()
  }));
};

/**
 * 返回空内容的正常相应 (204)
 */
exports.responseEmpty = function (res) {
  res.statusCode = 204;
  res.end(null);
};

/**
 * 返回空内容的正常相应 { msg: '404 Not Found', state: "error" }
 */
exports.responseNotFound = function (res) {
  res.statusCode = 404;
  res.end(JSON.stringify({msg: '404 Not Found', state: "error"}));
};

/**
 * 返回正常相应消息 {msg: ?, state: 'success', ot: '', ts: ''}
 */
exports.responseOk = function (res, msg, ot) {
  res.writeHead(200, {"Content-Type": "application/json;charset=utf-8"});
  // res.statusCode = 200;
  res.end(JSON.stringify({
    state: 'success',
    msg: msg,
    ot: ot,
    ts: new Date().getTime()
  }));
};

/**
 * 返回正常响应的数据 {data: ?, state: 'success', ot: '', ts: ''}
 */
exports.responseData = function (res, data, msg, ot) {
  res.writeHead(200, {"Content-Type": "application/json;charset=utf-8"});
  res.statusCode = 200;
  res.end(JSON.stringify({
    state: 'success',
    msg: msg,
    data: data,
    ot: ot,
    ts: new Date().getTime()
  }));
};

/**
 * 校验参数(支持部分规则：['required','max','min','validator'])
 * rule 是一个数组，其中是对参数设置规则比如： {code:{required:true,min:1,max:12,validator:()=>{}}}
 * @param {*} rule {code:{required:true,min:1,max:12,validator:()=>{}}}
 * @param {*} params App解析出来的params
 *  @param {*} callback (b_result,msg)
 */
exports.validator = function (rule, params, callback) {

  let fg = true,
      msgSet = new Set(),
      keys = [];

  if (rule) {
    keys = Object.keys(rule);
    if (keys.length < 1) {
      callback(fg, undefined);
      return;
    }

    keys.forEach(key => {
      if (fg) {
        let v = params[key], r = rule[key], vd;

        vd = r[ruleParams.required];
        if (vd) {
          if (v === '' || v === undefined || v === null) {
            msgSet.add(`[${key}]参数是必填的项`);
            fg &= false;
          }
        }

        vd = r[ruleParams.max];
        if (vd !== undefined || vd !== null) {
          if (v && v.length > vd) {
            msgSet.add(`[${key}]参数最大长度为${vd}`);
            fg &= false;
          }
        }

        vd = r[ruleParams.min];
        if (vd !== undefined || vd !== null) {
          if (v && v.length < vd) {
            msgSet.add(`[${key}]参数最小长度为${vd}`);
            fg &= false;
          }
        }

        vd = r[ruleParams.validator];
        if (vd) {
          //如果有自定的校验
          fg &= vd(msgSet);
        }
      }
    });
  }

  callback(fg, msgSet.size > 0 ? [...msgSet.values()] : undefined);
};

/**
 * 将string参数为空（null，undefined，‘’），返回 null，不为空则格式化后返回
 */
exports.isEmptyToNull = function (p) {
  return p && p.length < 1 ? null : p ? p : null;
};

/**
 * 启动服务
 *
 * @param cfg : 服务配置参数
 * @param done : 完成创建之后执行的回调
 * @param every: 每次请求都会调用的回调，默认参数为 （req,res,p）,p为请求解析的参数，可以从中获取请求的url，请求参数等
 * @param fops : 配置处理Options请求的请求头的配置回调，默认参数为 （req,res,p）,p为请求解析的参数，可以从中获取请求的url，请求参数等
 */
exports.start = function (cfg, done, every, fops) {
  const def = {host: 'localhost', port: 8888, upDir: 'files'};

  // 系统默认参数处理
  if (cfg) {
    for (let [k,v] of Object.entries(def)) {
      cfg[k] = cfg[k] || v;
    }
  } else {
    cfg = def;
  }


  console.log('系统配置为：', cfg);
  // 判别是否存在存储目录，没有就创建
  _fs.exists(cfg.upDir, function (exists) {
    if (exists) {
      console.log("已识别文件存储路径！");
    } else {
      _fs.mkdir(cfg.upDir, function (err) {
        if (err) {
          return console.log(err);
        } else {
          console.log("已创建文件存储路径！");
        }
      })
    }
  });

  // 仅仅内部使用
  const responseNotFound = function (res) {
    res.statusCode = 404;
    res.end(JSON.stringify({msg: '404 Not Found', state: "error"}));
  };

  // 仅仅内部使用
  const responseEmpty = function (res) {
    res.statusCode = 204;
    res.end(null);
  };

  _http_.createServer((req, res) => {
  })
      .listen(cfg.port, cfg.host, () => {
        console.log(`Server running at http://${cfg.host}:${cfg.port}/`);
        if (done) done();
      })
      .on('request', (request, response) => {
        //必须监听error并处理，否则错误会中断node服务器运行，从而结束服务
        request.on('error', (err) => console.error(err.stack));

        // 从request中取方法和url
        const {method, url} = request;
        if (url === "/favicon.ico") {
          responseNotFound(response);
          return;
        }

        // 注意，最后的参数为 true 时，p中的query参数是一个对象，为 false 时候则是 原始参数串
        const p = _url_.parse(request.url, true);
        //请求头参数名必须小写
        const {headers} = request;
        const userAgent = headers['user-agent'];
        /** 此处是打印一下请求的信息，好方便于检测 */
        console.log(`${request.method} | ${request.url} | ContentType: ${headers['content-type']}`);

        // 关于Options的不通过的原因是请求头不识别，或者没有权限
        if (request.method === 'OPTIONS') {
          // 此处备注：写在这里是因为后面的fops中如果有重设请求头，就会覆盖掉，这个需要注意
          response.setHeader("Access-Control-Allow-Origin", "*");
          response.setHeader("Access-Control-Allow-Methods", "OPTIONS");
          response.setHeader("Access-Control-Allow-Headers", "content-type");

          if (fops) {
            // 将参数暴露，这样就可以在初始化的时候添加额外的信息
            fops(request, response, p);
          }

          response.statusCode = 204;
          response.end();
          return;
        }

        // 正常的请求的处理
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Methods', 'PUT,POST');
        // response.setHeader('Access-Control-Allow-Credentials', 'true');

        // 不缓存
        response.setHeader("cache-control", "no-cache");
        // 设置返回的内容的格式(这里已经设置一个json格式的，后续的不需要再添加？)
        response.setHeader("content-type", "application/json; charset=utf-8");
        let time = new Date().getTime();
        response.setHeader("etag", "" + time);
        response.setHeader("User-Agent", "" + userAgent);


        // 为了扩展通用的申请中的特殊情况，这里扩展一个请求的回调，实现对每个请求的额外限制的可能
        // 比如给服务器扩展添加一些请求头，截流，进行请求参数校验等等；
        // 此处的设置回覆盖上面之前设置的请求头配置；这个需要注意
        if (every) every(request, response, p);

        // console.log(p);
        // 支持GET和POST请求
        if (method === "GET") {
          let func = __S.actions.get(p.pathname);
          if (func) {
            func(request, response, p.query);
          } else {
            responseNotFound(response);
          }
        } else if (method === "POST") {
          // 采用中间件来实现post的处理，自行处理不方便处理图片和文件，所以对于非纯文本的，最好采用中间件
          // 使用参见： https://www.npmjs.com/package/formidable
          // console.log(__dirname) # 查看当前的路径信息
          const form = new _formidable.IncomingForm();
          // 扩展属性，用于存放多文件上传的时候的文件数据
          form.___files = [];
          form.___filesInfos = [];
          form.___filedName = undefined;
          form.encoding = 'utf-8';
          // 注意，此处的指定的目录必须存在，否则会报错的！由form中间件来实现文件的上传，我们需要配置上传的目录
          // 此处注意，因为__dirname是当前js的文件所在的目录，所以下面的目录就是当前js所在目录的同级下创建imgs目录
          form.uploadDir = path.join(__dirname, path.join('../', cfg.upDir));

          // 处理请求中的文件
          form.on('file', function (name, file) {
            // console.log(file);
            // 上传的文件存放起来
            form.___files.push(file);
            // 上传字段名称（key）
            form.___filedName = name;
            const info = {
              key: name,
              size: file.size,
              name: file.name,
              type: file.type,
              lastModifiedDate: file.lastModifiedDate
            }

            // 对于jpeg的转换成jpg存储
            info.type = info.type.replace(/(jpeg)/ig, 'jpg');

            let fileType = info.type.split(/\//);

            info.bType = fileType[0];
            info.sType = fileType[1];
            info.suffix = '.' + fileType[1];

            _fs.rename(file.path, path.join(path.dirname(file.path), file.lastModifiedDate.getTime() + info.suffix), (err) => {
              if (err) console.error(err);
            });

            info.fileName = file.lastModifiedDate.getTime() + info.suffix;

            // 最后记录文件的信息，不含原始文件，原始文件请在request的扩展属性中去取即可；
            form.___filesInfos.push(info);
          });

          // 转换解析请求
          form.parse(request, function (err, fields, files) {
            // 将上传的文件，用文件组的方式传递到下一级，注意，我这里是
            request.extpars = {};
            request.extpars[form.___filedName] = form.___files;
            // 将文件信息组放在参数中向后传递
            fields[form.___filedName] = form.___filesInfos;
            // 将第一个文件的信息提出来，这个是方便于经常的只有一个上传文件的时候，方便于直接取用
            fields['firstFile'] = form.___filesInfos.length > 0 ? form.___filesInfos[0] : {};
            // 调用路由配对的执行任务
            let func = __S.actions.get(p.pathname);
            if (func) {
              func(request, response, fields);
            } else {
              responseNotFound(response);
            }
          });
        } else {
          // empty return of unkonw request
          responseEmpty(response);
        }
      });
};

/**
 * 添加路由规则
 * @param {*} url
 * @param {*} callback
 */
exports.route = (url, callback) => {
  __S.actions.set(url, callback);
};

/**
 * 获取数字 Id
 * @returns {number}
 */
exports.glId = () => {
  const date = new Date();
  return parseInt(`${date.getFullYear()}${(date.getMonth() + 1)}${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}`);
};

/**
 * 获取短数字 id
 */
exports.gsId = () => {
  const date = new Date();
  return parseInt(date.getTime() / 1000 - 1563414027);
}
/**
 * 数据参数格式化函数
 * 此函数的设计目的是将请求传入的参数，按照指定的类型进行格式化，
 * 基本类型为：['number', 'string', boolean, date]，其他的处理默认按照null来处理，此为考虑到数据库的null处理
 * 日期按照ts来处理，就是自动的转换成时间戳存储
 *
 * @param ps 请求的参数对象
 * @param b 参数类型格式化指定对象，比如 {id: 'number'}
 * @since 2.0
 */
exports.reqDataFormat = function (ps, b) {
  let fds = Object.keys(b);
  fds.forEach(key => {
    if (ps[key]) {
      switch (b[key]) {
        case 'date':
        case 'number': {
          ps[key] = Number(ps[key]);
          break;
        }
        case 'string': {
          ps[key] = String(ps[key]);
          break;
        }
        case 'boolean': {
          ps[key] = Boolean(ps[key]);
          break;
        }
        default :
          ps[key] = null;
      }
    } else {
      ps[key] = null;
    }
  });
}