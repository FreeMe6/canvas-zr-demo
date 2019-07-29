/*
* Mu html space
* */
const MU = {
  vue: undefined,

  init() {
    this.vue = new Vue({
      el: '#app',
      methods: {
        //test
        // 1. 序列化数据查看
        handleToObject() {
          console.log('To Serilaizibel Data (Object)', this.canvas.toObject())
        },
        handleToJson() {
          console.log('To Serilaizibel Data (Json)', this.canvas.toJSON())
        },
        handleShowAllObjects () {
          console.log('as canvas all objects', this.canvas.getObjects())
        },

        // asset
        doReloadAssertList() {
          jsonGetLocalData('/list_asset.do', {}, d => {
            this.dataAssets = getRows(d);
          }, window.cavs.port_cfg)
        },
        formAssetFormat() {
          let file = this.formAsset.file[0];
          this.formAsset.file = undefined;
          let formData = new FormData();
          Object.entries(this.formAsset).map(([k, v]) => formData.append(k, v));
          // 如果有多个图，可以多次对相同key进行添加
          formData.append('file', file, file.name || ('blob.' + file.type.substr('image/'.length)));
          return formData;
        },

        // dialog asset
        handleDialogFileChange(e) {
          console.log(e.target.files);
          this.formAsset.file = e.target.files;
        },
        handleDialogReset() {
          this.assetEditDialog.visibleAssetDialog = false
          this.assetEditDialog.active = 'add'
          this.formAsset.code = undefined
          this.formAsset.name = undefined
          this.formAsset.voltage = undefined
          this.formAsset.current = undefined
          this.formAsset.power = undefined
          this.formAsset.file = undefined
          $('input[type=file]').val(null);
        },
        handleDialogClose(done) {
          if (done) done()
          this.handleDialogReset();
        },
        handleDialogCancel() {
          this.handleDialogReset();
        },
        handleDialogSave() {
          jsonPostLocalMutiptData('/upload_asset.do', this.formAssetFormat(), data => {
            this.$message(getCommonReqMessage(data));
            this.handleDialogReset()
            this.doReloadAssertList()
          }, window.cavs.port_cfg)
        },

        // main asset
        handleAssetDclick(asset) {
          const S = this;

          // 注册设备信息，关联对象，否则怎么数据变化？

          const gadd = (asset) => {
            const cfg = {
              fsize: 12,
              oxb: 1,
              oyb: 1,
              getOx(scale) {
                if (scale === 0) return this.oxb
                return scale * this.oxb
              },
              getOy(scale) {
                if (scale === 0) return this.oyb
                return scale * this.oyb
              }
            }
            const childs = [
              new fabric.Text('设备编号：' + asset.code, {
                fontSize: cfg.fsize,
                originX: cfg.getOx(0),
                originY: 0
              }),
              new fabric.Text('设备名称：' + asset.name, {
                fontSize: cfg.fsize,
                originX: cfg.getOx(1),
                originY: cfg.getOy(1)
              }),
              new fabric.Text('电压：' + asset.voltage + ' V', {
                fontSize: cfg.fsize,
                originX: cfg.getOx(1),
                originY: cfg.getOy(2)
              }),
              new fabric.Text('电流：' + asset.current + ' A', {
                fontSize: cfg.fsize,
                originX: cfg.getOx(1),
                originY: cfg.getOy(3)
              }),
              new fabric.Text('功率：' + asset.power + ' W', {
                fontSize: cfg.fsize,
                originX: cfg.getOx(1),
                originY: cfg.getOy(4)
              })
            ];

            fabric.Image.fromURL(this.photoDir + asset.photo, function (oImg) {
              oImg.scale(0.3).set({top: 0, left: 10});
              // oImg.set('height', '40px');
              console.log(oImg)
              childs.push(oImg)

              S.canvas.add(new fabric.Group(childs, {
                top: 0,
                left: 0
              }))
            });
          }


          const moreAdd = (asset) => {
            const cfg = {
              fsize: 14
            }
            const childs = [
              new fabric.Text('设备编号：' + asset.code, {
                fontSize: cfg.fsize
              }),
              new fabric.Text('设备名称：' + asset.name, {
                fontSize: cfg.fsize,
                fontWeight:'bold'
              }),
              new fabric.Text('电流：' + asset.current + ' A', {
                fontSize: cfg.fsize
              }),
              new fabric.Text('功率：' + asset.power + ' W', {
                fontSize: cfg.fsize
              })
            ];

            let vv = new fabric.Text('电压：' + asset.voltage + ' V', {
              fontSize: cfg.fsize
            });

            fabricAttchToObject(vv, new Map([
                ['astId', asset.id]
            ]));


            console.log('Add asset of voltage el info ', vv);
            childs.push(vv);

            fabric.Image.fromURL(this.photoDir + asset.photo, function (oImg) {
              oImg.scale(0.3).set({top: 0, left: 10});

              for(let e of childs) {
                S.canvas.add(e);
              }

              S.canvas.add(oImg)
            });
          }
          moreAdd(asset);

        },
        handleDialogShow() {
          this.assetEditDialog.visibleAssetDialog = true
        },

        // canvas data
        handleDialogSaveCanvas () {
          console.log()
          // save canvas json data
          jsonPostLocalData('/save_draw.do', {content: JSON.stringify(this.canvas.toJSON())}, data => {
            this.$message(getCommonReqMessage(data));
            this.canvas.clear();
          }, window.cavs.port_cfg)
        },
        handleDialogLoadCanvas () {
          jsonGetLocalData('/list_draw.do', {}, data => {
            this.dataCanvasDatas = getRows(data);
          }, window.cavs.port_cfg)
        },
        handleSelectDataToRedraw (v) {
          console.log('Select Serilaizibel Data', JSON.parse(v));

          // 根据选择的json数据还原画板数据
          this.canvas.loadFromJSON(v)
        },
        beat(inf) {
          const  S = this;
          WS10.jsonDataService('simValue', {bv: 220, adj: 10}, d => {
            let voltage = d.data;

            // 获取所有对象进行对号入座
              // 如果是： 不同的类型进行不同的处理
            S.canvas.getObjects().filter(o => o.astId !== undefined).forEach(a => {
              if (parseInt(a.astId) === 108983){
                if (voltage > 219) {
                  a.set({text: '电压：' + parseFloat(voltage).toFixed(2)+'V', fill: 'red'})
                } else {
                  a.set({text: '电压：' + parseFloat(voltage).toFixed(2)+'V', fill: '#000'})
                }
              }
            })

            fabricRenderAll(S.canvas);
          });
        }
      },
      mounted() {
        // 加载设备列表
        this.doReloadAssertList();
        this.canvas = new fabric.Canvas('canvas')
        WS10.connect('页面端ws客户端（ST01122').ready(function (me) {
              me.jsonDataService('readServiceList', {}, d => console.log(d));
            });

        // 创建定时任务执行心跳
        Rr.runxms('t-1',8,this.beat);
      },
      data: function () {
        return {
          canvas: undefined,
          photoDir: '../server/files/',
          formAsset: {
            id: undefined,
            code: undefined,
            name: undefined,
            voltage: undefined,
            current: undefined,
            power: undefined,
            file: undefined
          },
          assetEditDialog: {
            active: 'add',
            title: {add: '添加设备', edit: '编辑设备'},
            width: '600px',
            visibleAssetDialog: false,
          },
          dataAssets: [],
          dataCanvasDatas: []
        }
      },
    })
  }
}