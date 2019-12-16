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
      </el-button-group>   
      宽度<el-input-number v-model="maskWidth" controls-position="right" :min="1" :max="imgWidth"></el-input-number>
      高度<el-input-number v-model="maskHeight" controls-position="right" :min="1" :max="imgWidth"></el-input-number>
    </el-row>
    <el-row v-else-if="state=='rotate'">
      <el-button-group>
        <el-button @click="refreshAngle()">取消</el-button>
        <el-button @click="changeAngle('left')">左旋转90</el-button>
        <el-button @click="changeAngle('right')">右旋转90</el-button>
        <el-button @click="changeAngle('x')">水平翻转</el-button>
        <el-button @click="changeAngle('y')">垂直翻转</el-button>
        <el-button @click="toRotate()">应用</el-button>
      </el-button-group> 
    </el-row>
    <el-row v-else-if="state=='resetSize'" type="flex" justify="center" style="margin:0 auto;margin-top:20px;">
        <el-col :span="2"><el-button @click="refreshSize()">取消</el-button></el-col>
        <el-col :span="6">
          <el-input v-model="imgScaledWidth"><template slot="prepend">宽</template></el-input>
        </el-col>
        <el-col :span="2">
          <el-button icon="el-icon-lock" type="primary" v-if="lockScale==true" @click="lockScale=false"></el-button>
          <el-button icon="el-icon-unlock" type="primary" v-else @click="lockScale=true"></el-button>
        </el-col>
        <el-col :span="6">
          <el-input v-model="imgScaledHeight"><template slot="prepend">高</template></el-input>
        </el-col>
        <el-col :span="2"><el-button @click="toResetSize()">应用</el-button></el-col>
    </el-row>
    <el-row class="canvasDiv">
      <el-col :span="24" style="margin: 0 auto;">
      <canvas id="canvas" width="1800" height="800"></canvas>
      <!-- <canvas id="canvas_clip" width="900" height="750" style="visibility: hidden;"></canvas> -->
      <img :src="imgSrc" id="img" style="display:none" @load="init" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      canvas_clip: new fabric.Canvas("canvas_clip"),
      imgSrc: "../static/test.jpg",
      imgAngle: 0,
      curImgAngle: 0,
      rotateMode:"",
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
      clipLeft:0,
      clipTop: 0,
      clipWidth: 0,
      clipHeight: 0,
      state: "",
      clipBtnsVisible: false,
      rotateBtnsVisible: false,
    };
  },
  watch:{
    imgScaledWidth: function(){
      if(this.lockScale){
        this.imgScaledHeight = this.imgScaledWidth/this.imgScale;
      }
    },
    imgScaledHeight: function(){
      if(this.lockScale){
        this.imgScaledWidth = this.imgScaledHeight*this.imgScale;
      }
    }
  },
  methods: {
    init() {
      this.canvas = this.__canvas = new fabric.Canvas("canvas");
      var img = document.getElementById("img");
      this.image = new fabric.Image(img, {
        left: 0,
        top: 0,
        angle: this.imgAngle,
        // lockMovementX: true,
        // lockMovementY: true,
        // lockRotation: true,
        // hasControls: false, // 编辑框
        // selectable: false,
      });
      this.imgWidth = this.image.width;
      this.imgHeight = this.image.height;
      this.image.crossOrigin = "anonymous";
      this.refreshScale();
      this.image.setCoords();
      this.canvas.add(this.image);
      this.image.center();
      this.mask = new fabric.Rect({
        left: this.image.left,
        top: this.image.top,
        originX: 'left',
        originY: 'top',
        scaleX: this.image.scaleX,
        scaleY: this.image.scaleY,
        selectable: false,
        stroke: "#F5A623",
        strokeWidth: 5,
        cornerColor: '#F5A623',
        fill: "rgba(255, 255, 255, 0)",
        visible: false,
        objectCaching: false,
        padding: 0,
        angle: this.image.angle
      });
      // this.mask.width = this.image.width * this.image.scaleX;
      // this.mask.height = this.image.height * this.image.scaleY;
      this.mask.width = this.image.width;
      this.mask.height = this.image.height;
      this.mask.setCoords();
      this.canvas.renderAll();
      this.imgScale = this.image.width/this.image.height;
      this.maskWidth = this.mask.getScaledWidth();
      this.maskHeight = this.mask.getScaledHeight();
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
    changeAngle(command) {
      this.imgAngle = this.curImgAngle = this.image.angle;
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
        this.image.set("scaleX", -1);
      } else if (command == "y") {
        this.image.set("scaleY", -1);
      }
      if (this.curImgAngle % 90 == 0 && this.curImgAngle != 180 && 
        this.curImgAngle != 0 && this.curImgAngle != 360) {
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
    refreshAngle(){ // 取消角度的变化
      this.state = "";
      debugger
      this.image.set("angle",this.imgAngle);
      if (this.imgAngle % 90 == 0 && this.imgAngle != 180 && 
        this.imgAngle != 0 && this.imgAngle != 360) {
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
    toRotate(){
      if(this.rotateMode == "left" || this.rotateMode == "right"){
        this.imgScaledWidth = this.image.getScaledHeight();
        this.imgScaledHeight = this.image.getScaledWidth();
        this.imgScale = 1/this.imgScale;
      }   
    },
    // 改变尺寸相关方法
    refreshSize(){ // 取消尺寸的变化
      this.state = "";
    },
    toResetSize(){
      if(this.lockScale){
        if(this.imgScaledHeight <= this.canvas.height){
         if(this.imgScaledWidth > this.imgScaledHeight){
            this.image.scaleToHeight(this.imgScaledHeight);
          }else{
            this.image.scaleToWidth(this.imgScaledWidth);
          }
        }else{
          this.imgWidth = this.imgScaledWidth;
          this.imgHeight = this.imgScaledHeight;
        }   
      }else{
          if(this.imgScaledWidth > this.imgScaledHeight){
            // this.image.scaleToWidth(this.imgScaledWidth);
            this.image.set('scaleX', this.imgScaledWidth/this.image.width)
            this.image.set('scaleY', this.imgScaledHeight/this.image.height)
          }else{
            // this.image.scaleToHeight(this.imgScaledHeight);
            this.image.set('scaleX', this.imgScaledWidth/this.image.width)
            this.image.set('scaleY', this.imgScaledHeight/this.image.height)
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
      this.state = "clip";
      // this.mask = new fabric.Rect({
      //   left: this.image.left,
      //   top: this.image.top,
      //   originX: 'left',
      //   originY: 'top',
      //   // selectable: false,
      //   stroke: "#F5A623",
      //   strokeWidth: 5,
      //   cornerColor: '#F5A623',
      //   fill: "rgba(255, 255, 255, 0)",
      //   // fill: "#757575",
      //   // opacity: 0.6,
      //   objectCaching: false,
      //   // scaleX: this.image.scaleX,
      //   // scaleY: this.image.scaleY,
      //   // selectionBackgroundColor: "rgba(255, 255, 255, 0)",
      //   padding: 0,
      //   angle: this.image.angle
      // });
      // this.mask.width = this.image.width * this.image.scaleX;
      // this.mask.height = this.image.height * this.image.scaleY;
      // this.mask.setCoords();
      this.mask.set('visible',true);
      this.canvas.add(this.mask).setActiveObject(this.mask);
      this.canvas.bringToFront(this.mask);
      
      // this.cloneImg = this.image; 
      // this.cloneImg.set({
      //   stroke: "#F5A623",
      //   strokeWidth: 5,
      //   cornerColor: '#F5A623',
      //   fill: "#757575",
      // });
      // this.canvas.add(this.cloneImg).setActiveObject(this.cloneImg);
      this.canvas.renderAll();
    },
    removeMask() { // 取消
      this.state = "";
      this.canvas.remove(this.mask);
    },
    clipImage(command) { // 选择裁剪框尺寸
      var min;
      if (this.image.getScaledWidth() > this.image.getScaledHeight()) {
        min = this.image.getScaledHeight();
      } else {
        min = this.image.getScaledWidth();
      }
      if (command == "1:1") {
        this.mask.set('height', min/this.mask.scaleY);
        this.mask.set('width', min/this.mask.scaleX);
        // this.mask.set('scaleX', min/this.mask.width)
        // this.mask.set('scaleY', min/this.mask.height)
      }else if(command == "3:2"){
        if(this.imgScale > 1){
          this.mask.set('height', min);
          this.mask.set('width', 3/2*min);
        }else{
          this.mask.set('width', min);
          this.mask.set('height', 3/2*min);
        }
      }else if(command == "4:3"){
        if(this.imgScale > 1){
          this.mask.set('height', min);
          this.mask.set('width', 4/3*min);
        }else{
          this.mask.set('width', min);
          this.mask.set('height', 4/3*min);
        }
      }else if(command == "16:9"){
        if(this.imgScale > 1){
          this.mask.set('height', min);
          this.mask.set('width', 16/9*min);
        }else{
          this.mask.set('width', min);
          this.mask.set('height', 16/9*min);
        }
      }
      this.mask.setCoords();
      this.mask.center();
      this.canvas.renderAll();
      this.maskWidth = this.mask.getScaledWidth();
      this.maskHeight = this.mask.getScaledHeight();
    },
    toClip() {
      this.state = "",
      
      // this.clipLeft = (this.mask.left-this.image.left)*1;
      // this.clipTop = (this.mask.top-this.image.top)*1;
      // this.clipWidth = this.mask.width * 1 * this.mask.scaleX;
      // this.clipHeight = this.mask.height * 1 * this.mask.scaleY;

      this.mask.setCoords();
      this.image.setCoords();
      var x = this.mask.left - this.image.left;
      var y = this.mask.top - this.image.top;
      x *= 1 / this.mask.scaleX;
      y *= 1 / this.mask.scaleY;
      if(y < 0) y = 0;
      var width = this.mask.getScaledWidth();
      var height = this.mask.getScaledHeight();
      debugger
      // this.image.clipPath = new fabric.Rect({
      //   top: y,
      //   left: x,
      //   width: width,
      //   height: height,
      //   scaleX: this.image.scaleX,
      //   scaleY: this.image.scaleY,
      // });
      
      this.image.set({
        clipTo: function(ctx) {
          console.log("ctx")
          console.log(ctx);
          ctx.rect(x,y,width,height);
        }
      })

      this.mask.setCoords();
      this.image.setCoords();
      // this.image.clipPath.setCoords();
      // this.canvas.remove(this.mask);
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
