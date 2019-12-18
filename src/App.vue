<template>
  <div id="app">
    <el-row>
      <el-button-group>
        <el-button type="primary" @click="addMask()">裁剪</el-button>
        <el-button type="primary" @click="state='resetSize'">尺寸</el-button>
        <el-button type="primary" @click="state='rotate'">旋转</el-button>
        <el-button type="primary" @click="state='rotate'">色温</el-button>
      </el-button-group>
    </el-row>
    <el-row v-if="state == 'clip'">
      请选择裁剪框的形状&nbsp;&nbsp;
      <el-select v-model="value" placeholder="请选择裁剪框的形状">
        <el-option v-for="item in shapes" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-row v-if="value == 'rect'">
        <el-button-group>
          <el-button @click="removeMask()">取消</el-button>
          <el-button @click="clipImage('1:1')">1:1</el-button>
          <el-button @click="clipImage('3:2')">3:2</el-button>
          <el-button @click="clipImage('4:3')">4:3</el-button>
          <el-button @click="clipImage('16:9')">16:9</el-button>
          <el-button @click="toClip()">应用</el-button>
        </el-button-group>&nbsp;&nbsp;
        框的宽度&nbsp;
        <el-input-number v-model="maskWidth" controls-position="right" :min="1" :max="imgWidth"></el-input-number>&nbsp;
        框的高度&nbsp;
        <el-input-number v-model="maskHeight" controls-position="right" :min="1" :max="imgWidth"></el-input-number>
      </el-row>
      <el-row v-else-if="value == 'circle'">
        <el-button @click="removeMask()">取消</el-button>&nbsp;&nbsp;
        框的半径&nbsp;
        <el-input-number
          v-model="maskRadius"
          controls-position="right"
          :min="1"
          :max="canvasHeight/2"
        ></el-input-number>&nbsp;&nbsp;
        <el-button @click="toClip()">应用</el-button>
      </el-row>
    </el-row>
    <el-row v-else-if="state == 'rotate'">
      <el-button-group>
        <el-button @click="restoreAngle()">取消</el-button>
        <el-button @click="changeAngle('left')">左旋转90</el-button>
        <el-button @click="changeAngle('right')">右旋转90</el-button>
        <el-button @click="changeAngle('x')">水平翻转</el-button>
        <el-button @click="changeAngle('y')">垂直翻转</el-button>
        <el-button @click="toRotate()">应用</el-button>
      </el-button-group>
    </el-row>
    <el-row v-else-if="state=='resetSize'"
      type="flex" justify="center" style="margin:0 auto;margin-top:20px;">
      <el-col :span="2">
        <el-button @click="refreshSize()">取消</el-button>
      </el-col>
      <el-col :span="6">
        <el-input v-model="imgScaledWidth">
          <template slot="prepend">宽</template>
        </el-input>
      </el-col>
      <el-col :span="2">
        <el-button
          icon="el-icon-lock"
          type="primary"
          v-if="lockScale==true"
          @click="lockScale=false"
        ></el-button>
        <el-button icon="el-icon-unlock" type="primary" v-else @click="lockScale=true"></el-button>
      </el-col>
      <el-col :span="6">
        <el-input v-model="imgScaledHeight">
          <template slot="prepend">高</template>
        </el-input>
      </el-col>
      <el-col :span="2">
        <el-button @click="toResetSize()">应用</el-button>
      </el-col>
    </el-row>
    <el-row class="canvasDiv">
      <el-col :span="24" style="margin: 0 auto;">
        <canvas id="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
        <br />
        <img :src="imgSrc" id="img" style="display:none" @load="init" />
        <img :src="imgSrc_clip" id="img_clip" style="display:none" @load="init_clip" />
      </el-col>
    </el-row>
  </div>
</template>
<script>
export default {
  name: "App",
  data() {
    return {
      canvasWidth: 1800,
      canvasHeight: 800,
      imgSrc: "../static/test.jpg",
      imgSrc_clip: "",
      shapes: [
        {
          value: "rect",
          label: "矩形"
        },
        {
          value: "circle",
          label: "圆形"
        }
      ],
      value: "rect", // 裁剪框的形状值,默认为矩形
      imgAngle: 0,
      curImgAngle: 0,
      rotateMode: "", // 记录旋转模式
      canvas: {},
      image: new fabric.Image(),
      imgWidth: 0,
      imgHeight: 0,
      imgScaledWidth: 0,
      imgScaledHeight: 0,
      imgScale: 0,
      lockScale: true,
      mask: new fabric.Rect(),
      maskWidth: 0,
      maskHeight: 0,
      maskRadius: 0,
      maskLeft: 0,
      maskTop: 0,
      newImgWidth: 0,
      newImgHeight: 0,
      state: "", // 记录正在进行的编辑模式
      mousewheeling: false, // 是否鼠标滚轮中标志
      MISTAKE_NUM: 1, //边距容差
      MAX_SIZE: 2 // 放大倍数
    };
  },
  watch: {
    imgScaledWidth: function() {
      if (this.lockScale) {
        this.imgScaledHeight = this.imgScaledWidth / this.imgScale;
      }
    },
    imgScaledHeight: function() {
      if (this.lockScale) {
        this.imgScaledWidth = this.imgScaledHeight * this.imgScale;
      }
    },
    maskWidth: function() {
      if (this.maskWidth > this.image.getScaledWidth())
        this.maskWidth = this.image.getScaledWidth();
      this.mask.set("width", this.maskWidth);
      this.canvas.renderAll();
    },
    maskHeight: function() {
      if (this.maskHeight > this.image.getScaledHeight())
        this.maskHeight = this.image.getScaledHeight();
      this.mask.set("height", this.maskHeight);
      this.canvas.renderAll();
    },
    maskRadius: function() {
      var min;
      if (this.image.getScaledWidth() > this.image.getScaledHeight()) {
        min = this.image.getScaledHeight();
      } else {
        min = this.image.getScaledWidth();
      }
      if (this.maskRadius > min) this.maskRadius = min / 2;
      this.mask.set("radius", this.maskRadius);
      this.canvas.renderAll();
    },
    value: function() {
      this.image.clipPath = new fabric.Rect({
        top: 0,
        left: 0,
        width: this.canvas.width,
        height: this.canvas.height,
        fill: "silver",
        stroke: "silver",
        strokeDashArray: [5, 5],
        absolutePositioned: true,
        lockMovementX: true,
        lockMovementY: true,
        hasRotatingPoint: false,
        hasControls: true,
        selectable: false
      });
      this.image.clipPath.setCoords();
      this.canvas.renderAll();
      this.addMask();
    }
  },
  methods: {
    init() {
      var img = document.getElementById("img");
      var self = this;
      this.canvas = this.__canvas = new fabric.Canvas("canvas");
      this.image = new fabric.Image(img, {
        left: 0,
        top: 0,
        width: img.width,
        height: img.height,
        angle: this.imgAngle,
        clipPath: new fabric.Rect({
          top: 0,
          left: 0,
          width: img.width,
          height: img.height,
          fill: "silver",
          stroke: "silver",
          strokeDashArray: [5, 5],
          absolutePositioned: true,
          lockMovementX: true,
          lockMovementY: true,
          hasRotatingPoint: false,
          hasControls: true,
          selectable: false
        })
        // lockMovementX: true,
        // lockMovementY: true,
        // lockRotation: true,
        // hasControls: false, // 编辑框
        // selectable: false
      });
      this.imgWidth = this.image.width;
      this.imgHeight = this.image.height;
      this.image.crossOrigin = "anonymous";
      this.refreshScale();
      this.image.setCoords();
      this.canvas.add(this.image);
      this.image.center();
      this.image.setCoords();
      this.mask.setCoords();
      this.canvas.preserveObjectStacking = true; // 禁止选中图层时自定义顶部
      this.canvas.renderAll();
      this.imgScale = this.image.width / this.image.height;
      this.maskLeft = this.image.left;
      this.maskTop = this.image.top;
      this.newImgWidth = this.image.width;
      this.newImgHeight = this.image.height;
    },
    init_clip() {
      if (this.imgSrc_clip != "") {
        this.image.setSrc(this.imgSrc_clip);
        this.image.set({
          left: this.maskLeft,
          top: this.maskTop,
          scaleX: 1,
          scaleY: 1,
          width: this.newImgWidth,
          height: this.newImgHeight,
          clipPath: new fabric.Rect({
            left: 0,
            top: 0,
            width: this.canvas.width,
            height: this.canvas.height,
            fill: "silver",
            stroke: "silver",
            strokeDashArray: [5, 5],
            absolutePositioned: true,
            lockMovementX: true,
            lockMovementY: true,
            hasRotatingPoint: false,
            hasControls: true,
            selectable: false
          })
          // lockMovementX: true,
          // lockMovementY: true,
          // lockRotation: true,
          // hasControls: false, // 编辑框
          // selectable: false
        });
        this.imgWidth = this.image.width;
        this.imgHeight = this.image.height;
        this.imgScale = this.image.width / this.image.height;
        // this.refreshScale();
        this.image.setCoords();
        this.image.clipPath.setCoords();
        this.image.center();
        this.image.clipPath.center();
        this.image.setCoords();
        this.image.clipPath.setCoords();
      }
    },
    refreshScale() {
      if (this.imgWidth > this.canvas.width) {
        this.image.scaleToWidth(this.canvas.width);
        console.log("适应画布的宽" + this.image.getScaledWidth());
      }
      if (this.image.getScaledHeight() > this.canvas.height) {
        this.image.scaleToHeight(this.canvas.height);
        console.log("适应画布的高" + this.image.getScaledHeight());
      }
      console.log("当前图片的高：" + this.image.getScaledHeight());
      this.imgScaledWidth = this.image.getScaledWidth();
      this.imgScaledHeight = this.image.getScaledHeight();
    },

    // 旋转相关方法
    // 选择旋转方式
    changeAngle(command) {
      debugger;
      this.curImgAngle = this.image.angle;
      this.rotateMode = command;
      console.log("图片原本的角度为：" + this.imgAngle);
      if (command == "left") {
        if (this.curImgAngle == 0) this.curImgAngle = 360;
        this.curImgAngle -= 90;
        this.image.set("angle", this.curImgAngle);
      } else if (command == "right") {
        if (this.curImgAngle == 360) this.curImgAngle = 0;
        this.curImgAngle += 90;
        this.image.set("angle", this.curImgAngle);
      } else if (command == "x") {
        if (
          this.curImgAngle == 0 ||
          this.curImgAngle == 180 ||
          this.curImgAngle == 360
        ) {
          this.image.set("scaleX", -1);
        } else {
          this.image.set("scaleY", -1);
        }
        this.image.scaleToWidth(this.imgScaledWidth);
        this.image.scaleToHeight(this.imgScaledHeight);
      } else if (command == "y") {
        if (
          this.curImgAngle == 0 ||
          this.curImgAngle == 180 ||
          this.curImgAngle == 360
        ) {
          this.image.set("scaleY", -1);
        } else {
          this.image.set("scaleX", -1);
        }
        this.image.scaleToWidth(this.imgScaledWidth);
        this.image.scaleToHeight(this.imgScaledHeight);
      }
      if (
        this.curImgAngle % 90 == 0 &&
        this.curImgAngle != 180 &&
        this.curImgAngle != 0 &&
        this.curImgAngle != 360
      ) {
        this.imgHeight = this.image.width;
        this.imgWidth = this.image.height;
        if (this.imgWidth > this.canvas.width) {
          this.image.scaleToHeight(this.canvas.width);
          console.log("图片适应画布的宽" + this.image.getScaledWidth());
        }
        if (this.image.getScaledWidth() >= this.canvas.height) {
          this.image.scaleToWidth(this.canvas.height);
          console.log("图片适应画布的高" + this.image.getScaledHeight());
        }
      } else {
        this.imgHeight = this.image.height;
        this.imgWidth = this.image.width;
        // 重设图片的缩放比例
        this.image.scaleToWidth(this.imgScaledWidth);
        this.image.scaleToHeight(this.imgScaledHeight);
        console.log(
          this.image.getScaledWidth() + "," + this.image.getScaledHeight()
        );
        this.refreshScale();
      }
      this.image.setCoords();
      this.image.center();
      this.canvas.renderAll();
    },
    // 取消角度的变化
    restoreAngle() {
      this.state = "";
      this.image.set("angle", this.imgAngle);
      if (
        this.imgAngle % 90 == 0 &&
        this.imgAngle != 180 &&
        this.imgAngle != 0 &&
        this.imgAngle != 360
      ) {
        this.imgHeight = this.image.width;
        this.imgWidth = this.image.height;
        if (this.imgWidth > this.canvas.width) {
          this.image.scaleToWidth(this.canvas.width);
          console.log("图片适应画布的宽" + this.image.getScaledWidth());
        }
        if (this.image.getScaledWidth() > this.canvas.height) {
          this.image.scaleToHeight(this.canvas.height);
          console.log("图片适应画布的高" + this.image.getScaledHeight());
        }
      } else {
        this.imgHeight = this.image.height;
        this.imgWidth = this.image.width;
        // 重设图片的缩放比例
        this.image.scaleToWidth(this.imgScaledWidth);
        this.image.scaleToHeight(this.imgScaledHeight);
        console.log(
          this.image.getScaledWidth() + "," + this.image.getScaledHeight()
        );
        this.refreshScale();
      }
      this.image.setCoords();
      this.image.center();
      this.canvas.renderAll();
    },
    toRotate() {
      this.imgAngle = this.image.angle;
      this.imgScaledWidth = this.image.getScaledHeight();
      this.imgScaledHeight = this.image.getScaledWidth();
      this.imgScale = 1 / this.imgScale;
    },

    // 改变尺寸相关方法
    refreshSize() {
      this.state = "";
    },
    toResetSize() {
      if (this.lockScale) {
        if (this.imgScaledHeight <= this.canvas.height) {
          if (this.imgScaledWidth > this.imgScaledHeight) {
            this.image.scaleToHeight(this.imgScaledHeight);
          } else {
            this.image.scaleToWidth(this.imgScaledWidth);
          }
        } else {
          this.imgWidth = this.imgScaledWidth;
          this.imgHeight = this.imgScaledHeight;
        }
      } else {
        if (this.imgScaledWidth > this.imgScaledHeight) {
          // this.image.scaleToWidth(this.imgScaledWidth);
          this.image.set("scaleX", this.imgScaledWidth / this.image.width);
          this.image.set("scaleY", this.imgScaledHeight / this.image.height);
        } else {
          // this.image.scaleToHeight(this.imgScaledHeight);
          this.image.set("scaleX", this.imgScaledWidth / this.image.width);
          this.image.set("scaleY", this.imgScaledHeight / this.image.height);
        }
      }

      this.image.setCoords();
      this.image.center();
      this.canvas.renderAll();
      this.imgScaledWidth = this.image.getScaledWidth();
      this.imgScaledHeight = this.image.getScaledHeight();
    },

    // 裁剪相关方法
    addMask() {
      this.state= "clip";
      if (this.mask) {
        this.canvas.remove(this.mask);
      }
      // if(this.value == "") this.value = "rect";
      if (this.value == "rect") {
        this.mask = new fabric.Rect({
          left: this.image.left,
          top: this.image.top,
          originX: "left",
          originY: "top",
          // selectable: false,
          stroke: "#F5A623",
          strokeWidth: 5,
          cornerColor: "#F5A623",
          fill: "rgba(255, 255, 255, 0)",
          // fill: "#757575",
          // opacity: 0.6,
          objectCaching: false,
          // scaleX: this.image.scaleX,
          // scaleY: this.image.scaleY,
          // selectionBackgroundColor: "rgba(255, 255, 255, 0)",
          padding: 0,
          angle: this.image.angle
        });
        this.mask.width = this.newImgWidth;
        this.mask.height = this.newImgHeight;
        this.mask.setCoords();
        this.canvas.add(this.mask).setActiveObject(this.mask);
        this.maskWidth = this.mask.getScaledWidth();
        this.maskHeight = this.mask.getScaledHeight();
      } else if (this.value == "circle") {
        var min;
        if (this.image.getScaledWidth() > this.image.getScaledHeight()) {
          min = this.image.getScaledHeight();
        } else {
          min = this.image.getScaledWidth();
        }
        this.mask = new fabric.Circle({
          radius: min / 2,
          fill: "rgba(255, 255, 255, 0)",
          // left: this.image.left + this.image.getScaledWidth() / 2,
          // top: this.image.top + this.image.getScaledHeight() / 2,
          left: this.image.left,
          top: this.image.top,
          stroke: "#F5A623",
          strokeWidth: 5
          // scaleX: this.image.scaleX,
          // scaleY: this.image.scaleY,
          // originX: "left",
          // originY: "top",
        });
        this.mask.setCoords();
        this.mask.center();
        this.mask.setCoords();
        this.mask.setControlsVisibility({mt: false, mr: false, mb: false, ml: false});
        this.canvas.add(this.mask).setActiveObject(this.mask);    
        this.maskWidth = this.mask.getScaledWidth();
        this.maskHeight = this.mask.getScaledHeight();
        this.maskRadius = this.mask.radius;
      }
      this.canvas.renderAll();
      this.state = "clip";
      this.scaleMask("on");
      this.scaleImage("on");
    },
    removeMask() {
      this.state = "";
      this.canvas.remove(this.mask);
      this.scaleImage("off");
      this.scaleMask("off");
    },
    // 选择裁剪框尺寸
    clipImage(command) {
      var min, max;
      if (this.image.getScaledWidth() > this.image.getScaledHeight()) {
        min = this.image.getScaledHeight();
        max = this.image.getScaledWidth();
      } else {
        min = this.image.getScaledWidth();
        max = this.image.getScaledHeight();
      }
      if (command == "1:1") {
        this.mask.set("height", min / this.mask.scaleY);
        this.mask.set("width", min / this.mask.scaleX);
      } else if (command == "3:2") {
        if (this.imgScale > 3 / 2) {
          if (this.imgScale > 1) {
            this.mask.set("height", min / this.mask.scaleY);
            this.mask.set("width", ((3 / 2) * min) / this.mask.scaleX);
          } else {
            this.mask.set("width", min / this.mask.scaleX);
            this.mask.set("height", ((2 / 3) * min) / this.mask.scaleY);
          }
        } else {
          if (this.imgScale >= 1) {
            this.mask.set("width", max / this.mask.scaleX);
            this.mask.set("height", (2 / 3) * this.image.width);
          } else {
            this.mask.set("height", max / this.mask.scaleY);
            this.mask.set("width", (3 / 2) * this.image.height);
          }
        }
      } else if (command == "4:3") {
        if (this.imgScale > 4 / 3) {
          if (this.imgScale > 1) {
            this.mask.set("height", min / this.mask.scaleY);
            this.mask.set("width", ((4 / 3) * min) / this.mask.scaleX);
          } else {
            this.mask.set("width", min / this.mask.scaleX);
            this.mask.set("height", ((3 / 4) * min) / this.mask.scaleY);
          }
        } else {
          if (this.imgScale >= 1) {
            this.mask.set("width", max / this.mask.scaleX);
            this.mask.set("height", (3 / 4) * this.image.width);
          } else {
            this.mask.set("height", max / this.mask.scaleY);
            this.mask.set("width", (4 / 3) * this.image.height);
          }
        }
      } else if (command == "16:9") {
        debugger
        if (this.imgScale > 16 / 9) {
          if (this.imgScale > 1) {
            this.mask.set("height", min / this.mask.scaleY);
            this.mask.set("width", ((16 / 9) * min) / this.mask.scaleX);
          } else {
            this.mask.set("width", min / this.mask.scaleX);
            this.mask.set("height", ((9 / 16) * min) / this.mask.scaleY);
          }
        } else {
          if (this.imgScale >= 1) {
            this.mask.set("width", max / this.mask.scaleX);
            this.mask.set("height", (9 / 16) * this.image.width);
          } else {
            this.mask.set("height", max / this.mask.scaleY);
            this.mask.set("width", (16 / 9) * this.image.height);
          }
          this.mask.set("top", this.image.top);
          this.mask.set("left", this.image.left);
        }
      }
      this.mask.setCoords();
      this.mask.center();
      this.canvas.renderAll();
      this.maskWidth = this.mask.getScaledWidth();
      this.maskHeight = this.mask.getScaledHeight();
    },
    toClip() {
      this.mask.setCoords();
      this.image.setCoords();
      this.maskLeft = this.mask.left;
      this.maskTop = this.mask.top;
      if (this.maskTop < 0) this.maskTop = 0;
      if (this.maskLeft < 0) this.maskLeft = 0;
      this.newImgWidth = this.maskWidth;
      this.newImgHeight = this.maskHeight;
      var radius = this.mask.radius;
      debugger
      if (this.value == "rect") {
        this.image.clipPath.set({
          top: this.maskTop,
          left: this.maskLeft,
          width: this.newImgWidth,
          height: this.newImgHeight
        });
        this.canvas.remove(this.mask);
        var img = this.canvas.toDataURL({
          left: this.maskLeft,
          top: this.maskTop,
          width: this.newImgWidth,
          height: this.newImgHeight
        });
        // this.imgSrc_clip = img;
        // this.canvas.renderAll();
      } else if (this.value == "circle") {
        debugger;
        this.image.clipPath = new fabric.Circle({
          top: this.maskTop,
          left: this.maskLeft,
          width: this.newImgWidth,
          height: this.newImgHeight,
          radius: radius,
          fill: "silver",
          stroke: "silver",
          strokeDashArray: [5, 5],
          absolutePositioned: true,
          lockMovementX: true,
          lockMovementY: true,
          hasRotatingPoint: false,
          hasControls: true,
          selectable: false
        });
        this.image.clipPath.set({
          top: this.maskTop,
          left: this.maskLeft,
          radius: radius,
          width: this.newImgWidth,
          height: this.newImgHeight
        });
        this.canvas.remove(this.mask);
        var img = this.canvas.toDataURL({
          left: this.maskLeft,
          top: this.maskTop,
          radius: radius,
          width: this.newImgWidth,
          height: this.newImgHeight
        });
        
      }
      this.imgSrc_clip = img;
      this.canvas.renderAll();
      this.scaleImage("off");
      this.scaleMask("off");
      this.state = "";
    },
    // 监听裁剪框的缩放
    scaleMask(command) {
      if(command == "on"){
        this.mask.on({
          scaling: e => {
            if (this.value == "rect") {
              this.maskWidth = this.mask.getScaledWidth();
              this.maskHeight = this.mask.getScaledHeight();
            } else if (this.value == "circle") {
              this.maskRadius = this.mask.getRadiusX();
            }
            console.log("mask is scaling");
          }
        });
      }else if(command == "off"){
        this.image.off("scaling");
        console.log("not listening mask scaling!")
      }
    },
    // 监听图片的缩放
    scaleImage(command) {
      if (command == "on") {
        this.image.on({
          mousewheel: opt => {
            console.log("event mousewheel");
            if (opt && opt.e) {
              opt.e.preventDefault();
              opt.e.stopPropagation();
            }
            if (this.mousewheeling) return;
            this.mousewheeling = true;
            var oriWidth, oriHeight;
            var delta = -(opt && opt.e && opt.e.deltaY) || 100;
            var width = (oriWidth = this.image.getScaledWidth());
            var height = (oriHeight = this.image.getScaledHeight());
            var oriLeft = this.image.get("left");
            var oriTop = this.image.get("top");
            // var clipWidth = this.image.clipPath.getScaledWidth();
            // var clipHeight = this.image.clipPath.getScaledHeight();
            var clipWidth = this.imgScaledWidth;
            var clipHeight = this.imgScaledHeight;
            var ratio = width / height;
            width = width + delta / 1;
            height = height + delta / 1;
            if (delta < 0 && (width <= clipWidth || height <= clipHeight)) {
              if (clipWidth / clipHeight > ratio) {
                this.image.scaleToWidth(clipWidth);
              } else {
                this.image.scaleToHeight(clipHeight);
              }
              this.keepPoint(opt, oriLeft, oriTop, oriWidth, oriHeight);
            } else if (
              delta > 0 &&
              (width >= this.image.get("width") * this.MAX_SIZE ||
                height >= this.image.get("height") * this.MAX_SIZE)
            ) {
            } else {
              this.image.scaleToWidth(width);
              this.keepPoint(opt, oriLeft, oriTop, oriWidth, oriHeight);
            }
            this.image.setCoords();
            this.mask.setCoords();
            this.canvas.renderAll();
            this.mousewheeling = false;
          }
        });
      } else if (command == "off") {
        this.image.off("mousewheel");
      }
    },
    keepPoint(opt, oriLeft, oriTop, oriWidth, oriHeight) {
      if (!opt || !opt.pointer) return;
      this.image.setCoords();
      var xRatio, yRatio;
      xRatio = (opt.pointer.x - oriLeft) / oriWidth;
      yRatio = (opt.pointer.y - oriTop) / oriHeight;
      var newTop = this.image.get("top");
      var newLeft = this.image.get("left");
      var newWidth = this.image.getScaledWidth();
      var newHeight = this.image.getScaledHeight();
      var newx = newWidth * xRatio + newLeft;
      var newy = newHeight * yRatio + newTop;
      this.image.set({
        top: newTop - (newy - opt.pointer.y),
        left: newLeft - (newx - opt.pointer.x)
      });
      this.image.setCoords();
    }
  },
  mounted() {

  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

canvas {
  border: 1px dashed black;
}

.el-row {
  margin-top: 10px;
}
</style>
