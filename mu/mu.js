/*
* Mu html space
* */
const MU = {
  vue: undefined,

  init() {
    this.vue = new Vue({
      el: '#app',
      methods: {
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
              new fabric.Text('电压：' + asset.voltage + ' V', {
                fontSize: cfg.fsize
              }),
              new fabric.Text('电流：' + asset.current + ' A', {
                fontSize: cfg.fsize
              }),
              new fabric.Text('功率：' + asset.power + ' W', {
                fontSize: cfg.fsize
              })
            ];
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
        }
      },
      mounted() {
        // 加载设备列表
        this.doReloadAssertList();
        this.canvas = new fabric.Canvas('canvas')
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
          dataAssets: []
        }
      },
    })
  }
}