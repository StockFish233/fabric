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
    <el-row v-if="state=='clip'">
      <el-button-group>
        <el-button @click="removeMask()">取消</el-button>
        <el-button @click="clipImage('1:1')">1:1</el-button>
        <el-button @click="clipImage('3:2')">3:2</el-button>
        <el-button @click="clipImage('4:3')">4:3</el-button>
        <el-button @click="clipImage('16:9')">16:9</el-button>
        <el-button @click="clipImage('自由比例')">自由比例</el-button>
        <el-button @click="toClip()">应用</el-button>
      </el-button-group>&nbsp;&nbsp;
      框的宽度<el-input-number v-model="maskWidth" controls-position="right" :min="1" :max="imgWidth"></el-input-number>
      框的高度<el-input-number v-model="maskHeight" controls-position="right" :min="1" :max="imgWidth"></el-input-number>
    </el-row>
    <el-row v-else-if="state=='rotate'">
      <el-button-group>
        <el-button @click="restoreAngle()">取消</el-button>
        <el-button @click="changeAngle('left')">左旋转90</el-button>
        <el-button @click="changeAngle('right')">右旋转90</el-button>
        <el-button @click="changeAngle('x')">水平翻转</el-button>
        <el-button @click="changeAngle('y')">垂直翻转</el-button>
        <el-button @click="toRotate()">应用</el-button>
      </el-button-group>
    </el-row>
    <el-row
      v-else-if="state=='resetSize'"
      type="flex"
      justify="center"
      style="margin:0 auto;margin-top:20px;">
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
        <img :src="imgSrc" id="img"  @load="init" />
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
      imgAngle: 0,
      curImgAngle: 0,
      rotateMode: "",
      image: new fabric.Image(),
      cloneImg: new fabric.Image(),
      imgWidth: 0,
      imgHeight: 0,
      imgScaledWidth: 0,
      imgScaledHeight: 0,
      imgScale: 0,
      lockScale: true,
      mask: new fabric.Rect(),
      maskWidth: 0,
      maskHeight: 0,
      left: 0,
      top: 0,
      clipLeft: 0,
      clipTop: 0,
      clipWidth: 0,
      clipHeight: 0,
      state: "",
      clipBtnsVisible: false,
      rotateBtnsVisible: false
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
    }
  },
  methods: {
    init() {
      var self = this;
      this.canvas = this.__canvas = new fabric.Canvas("canvas");
      var img = document.getElementById("img");
      debugger
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
        }),
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
      this.canvas.renderAll();
      this.imgScale = this.image.width / this.image.height;
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
      debugger
      if(this.mask){
        this.canvas.remove(this.mask);
      }
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
          scaleX: this.image.scaleX,
          scaleY: this.image.scaleY,
          // selectionBackgroundColor: "rgba(255, 255, 255, 0)",
          padding: 0,
          angle: this.image.angle
        });
        // this.mask.width = this.image.width * this.image.scaleX;
        // this.mask.height = this.image.height * this.image.scaleY;
        this.mask.width = this.image.clipPath.width;
        this.mask.height = this.image.clipPath.height;
        this.mask.setCoords();
        this.mask.set("visible", true);
        this.canvas.add(this.mask).setActiveObject(this.mask);
        this.canvas.bringToFront(this.mask);
        
        this.maskWidth = this.mask.getScaledWidth();
        this.maskHeight = this.mask.getScaledHeight();

      this.canvas.renderAll();
      this.state = "clip";
    },
    removeMask() {
      this.state = "";
      this.canvas.remove(this.mask);
    },
    // 选择裁剪框尺寸
    clipImage(command) {
      var min;
      if (this.image.getScaledWidth() > this.image.getScaledHeight()) {
        min = this.image.getScaledHeight();
      } else {
        min = this.image.getScaledWidth();
      }
      if (command == "1:1") {
        this.mask.set("height", min / this.mask.scaleY);
        this.mask.set("width", min / this.mask.scaleX);
      } else if (command == "3:2") {
        if (
          ((3 / 2) * this.image.getScaledWidth()) / this.mask.scaleX >
          this.image.getScaledHeight() / this.mask.scaleY
        ) {
          this.mask.set("height", min / this.mask.scaleY);
          this.mask.set("width", ((3 / 2) * min) / this.mask.scaleX);
        } else {
          this.mask.set("width", min / this.mask.scaleX);
          this.mask.set("height", ((3 / 2) * min) / this.mask.scaleY);
        }
      } else if (command == "4:3") {
        if (
          ((4 / 3) * this.image.getScaledWidth()) / this.mask.scaleX >
          this.image.getScaledHeight() / this.mask.scaleY
        ) {
          this.mask.set("height", min / this.mask.scaleY);
          this.mask.set("width", ((4 / 3) * min) / this.mask.scaleX);
        } else {
          this.mask.set("width", min / this.mask.scaleX);
          this.mask.set("height", ((4 / 3) * min) / this.mask.scaleY);
        }
      } else if (command == "16:9") {
        if (
          ((16 / 9) * this.image.getScaledWidth()) / this.mask.scaleX >
          this.image.getScaledHeight() / this.mask.scaleY
        ) {
          this.mask.set("height", min / this.mask.scaleY);
          this.mask.set("width", ((16 / 9) * min) / this.mask.scaleX);
        } else {
          this.mask.set("width", min / this.mask.scaleX);
          this.mask.set("height", ((16 / 9) * min) / this.mask.scaleY);
        }
      }
      this.mask.setCoords();
      this.mask.center();
      this.canvas.renderAll();
      this.maskWidth = this.mask.getScaledWidth();
      this.maskHeight = this.mask.getScaledHeight();
    },
    toClip() {
      (this.state = ""), 
      this.mask.setCoords();
      this.image.setCoords();
      var x = this.mask.left ;
      var y = this.mask.top ;
      var width = this.mask.getScaledWidth();
      var height = this.mask.getScaledHeight();
      
      this.image.clipPath.set({
        top: y,
        left: x,
        width: width,
        height: height,
      });
      
      // this.canvas.setWidth(this.mask.width);
      // this.canvas.setHeight(this.mask.height);
     debugger
     var img = this.canvas.toDataURL({
        left: x,
        top: y,
        width: width,
        height: height
      })
      this.image.setSrc(img);
      
      this.image.set('left', x);
      this.image.set('top', y);
      
      this.image.clipPath.set('left', x);
      this.image.clipPath.set('top', y);
      this.image.clipPath.set('width', width);
      this.image.clipPath.set('height', height);     
      // this.refreshScale();
      this.image.set('width', width / this.image.scaleX);
      this.image.set('height', height / this.image.scaleY);
      
      // this.imgSrc = this.canvas.toDataURL({
      //   left: x,
      //   top: y,
      //   width: width,
      //   height: height
      // });
      this.mask.setCoords();
      this.image.setCoords();
      this.image.clipPath.setCoords();
      this.canvas.remove(this.mask);
      this.canvas.renderAll();
    }
  },
  mounted() {
    // this.init();
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
  margin-top: 20px;
}

.canvasDiv {
  height: 900px;
  width: 1920px;
}
</style>
