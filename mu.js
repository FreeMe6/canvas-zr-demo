/*
* Mu html space
* */
const MU = {
  vue: undefined,

  init() {
    this.vue = new Vue({
      el: '#app',
      data: function () {
        return {
          lock: false,
          zr: undefined,
          // 图片地址
          photoDir: './files/',
          // 设备信息
          asset: {
            //设备唯一id
            id: undefined,
            //设备编号
            code: undefined,
            //设备名称
            name: undefined,
            //设备电压
            voltage: undefined,
            //设备电流
            current: undefined,
            //设备功率
            power: undefined,
            //设备图片
            file: undefined
          },
          dataAssets: []
        }
      },
      methods: {
        reload() {
          window.location.reload();
        },
        reloadAssert() {
          jsonGetLocalData('/list_asset.do', {}, d => {
            this.dataAssets = getRows(d);
          }, window.cavs.port_cfg)
        },
        formatAsset() {
          let file = this.asset.file[0];
          this.asset.file = undefined;
          let formData = new FormData();
          Object.entries(this.asset).map(([k, v]) => formData.append(k, v));
          // 如果有多个图，可以多次对相同key进行添加
          formData.append('file', file, file.name || ('blob.' + file.type.substr('image/'.length)));
          return formData;
        },
        handleFileChange(e) {
          console.log(e.target.files);
          this.asset.file = e.target.files;
        },
        move(group) {
          if (eMouseDown) {
            boundingRect.show()
            var rect = group.getBoundingRect();
            boundingRect.setShape({
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height
            });
            boundingRect.style.stroke = '#14f1ff'
          }
        },
        handleAssetDclick(asset) {
          const S = this;
          const astGroup = new zrender.Group();
          const w = this.zr.getWidth();
          const h = this.zr.getHeight();
          S.zr.add(astGroup);

          var t1 = new zrender.Text({
            meType: 'text',
            assetId: asset.id,
            propType: 'label',
            draggable: true,
            style: {
              text: `设备：${asset.name}`,
              textAlign: 'center',
              textVerticalAlign: 'middle',
              fontSize: 12,
              textFill: '#000'
            },
            position: [w / 2 + 5, h / 2]
          }).on('mousemove', function () {
            S.move(astGroup);
          }).on('click', function () {
            S.current = this;
            console.log(this);
          })

          var img = new zrender.Image({
            meType: 'image',
            assetId: asset.id,
            propType: 'photo',
            draggable: true,
            style: {
              // 设置图片的url
              image: this.photoDir + asset.photo,
              // 相对于左上角
              //x: 100,
              //y: 50,
              width: 40,
              height: 40
            },
            position: [w / 2 + 5, h / 2]
          }).on('mousemove', function () {
            S.move(astGroup);
          }).on('click', function () {
            S.current = this;
            console.log(this);
          })


          astGroup.add(t1).add(img);
        },
        uEditorResize() {
        },
        // 上传文件的测试
        handleUploadClick() {
          jsonPostLocalMutiptData('/upload_asset.do', this.formatAsset(), data => {
            this.$message(getCommonReqMessage(data));
            this.reload();
          }, window.cavs.port_cfg)
        }
      },
      mounted() {
        this.hideShade = true;
        this.zr = zrender.init(document.getElementById('main'), {
          width: 800,
          height: 600
        });

        this.zr.on('mousedown', function () {
          eMouseDown = true;
        });
        this.zr.on('mouseup', function () {
          eMouseDown = false;
        });

        boundingRect = new zrender.Rect({
          shape: {
            cx: 0,
            cy: 0,
            x: 0,
            y: 0,
            width: 0,
            height: 0
          },
          style: {
            fill: 'none',
            stroke: '#14f1ff'
          }
        });
        this.zr.add(boundingRect);

        this.zr.on('click', function () {
          // 如果按下时，没有选中对象则可以隐藏了
          if (!this._downEl) {
            boundingRect.hide()
          }
          console.log(this._downEl);
        })

        // 加载设备列表
        this.reloadAssert();

        window.addEventListener('resize', (me => {
          setTimeout(me.uEditorResize(), 300);
        })(this), false);
      }
    })
  }
}