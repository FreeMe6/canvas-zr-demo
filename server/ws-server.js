const Server = require('./libs/ws-server_node-1.0');
Server.start();


Server.addService('count_area', '计算园的面积', d => {
  return d.r * d.r * 3.1415926;
});

Server.addService('getVoltage', '获取模拟电压，自动波动10v内变化', d => {
  return 0;
});

Server.addService('readServiceList', '获取服务列表', d => {
  return Server.getServiceList();
});

Server.addService('readClientRegister', '获取客户端注册表', d => {
  return Server.getClientRegister();
});