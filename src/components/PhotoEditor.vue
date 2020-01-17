<template>
  <div class="editor" id="editor">
    <el-row style="margin: 0;" class="content">
      <el-col :md="24">
        <el-row id="nav">
          <el-row class="nav-box" type="flex" justify="center" style="margin: 0 auto;width: 100%;" v-if="state == ''">
            <div style="width: 450px;float: left">
            <el-button-group style="margin: 0 auto;">
              <el-button icon="el-icon-refresh-left" :disabled="returnPrevious" 
                class="left-button" @click="returnBack('previous')">
              </el-button>
              <el-button icon="el-icon-refresh-right" :disabled="returnNext" 
                class="left-button" @click="returnBack('next')">
              </el-button>
            </el-button-group>
            <el-button-group>
              <el-button @click="chooseClip()" class="nav-button">裁剪</el-button>
              <el-button @click="chooseFilters()" class="nav-button">色彩</el-button>
              <el-button @click="drawer = true" class="nav-button">添加图片</el-button>
            </el-button-group>
            <el-button @click="save()" class="right-button">保存</el-button>
            </div>
            <div style="margin-top: 10px;float：right">
            <el-switch v-model="adaptToWindow" active-text="适应窗口的变化" ></el-switch>
            </div>
          </el-row>
          <el-row class="sub-nav-box" v-if="state == 'clip'">
            <el-row type="flex" justify="center" >
              <el-button-group class="nav-button">
                <el-button icon="el-icon-refresh-left" :disabled="returnPrevious"
                  class="subNav-button" @click="returnBack('previous')">
                </el-button>
                <el-button icon="el-icon-refresh-right" :disabled="returnNext"
                  class="subNav-button" @click="returnBack('next')">
                </el-button>
              </el-button-group>&nbsp;&nbsp;
              <el-button @click="cancelClip()" class="subNav-button">取消</el-button>
              <span class="text">&nbsp;&nbsp;目前图片的宽&nbsp;</span>
              <el-input-number v-model="imgScaledWidth" class="inputStyle"  @change="changeImgScaledWidth()"
                :min="1"  :controls="false"></el-input-number>&nbsp;
              <el-button icon="el-icon-lock" v-if="lockImageScale==true" class="subNav-button"
                @click="lockImageScale=false"></el-button>
              <el-button icon="el-icon-unlock" v-else @click="lockImageScale=true" 
                class="subNav-button unLock"></el-button>
              <span class="text">&nbsp;&nbsp;目前图片的高&nbsp;</span>
              <el-input-number v-model="imgScaledHeight" class="inputStyle"  @change="changeImgScaledHeight()"
                :controls="false" :min="1" ></el-input-number>
              <span class="text">&nbsp;&nbsp;请选择裁剪形状&nbsp;</span>
              <el-select v-model="maskShape" style="width: 100px;">
                <el-option v-for="item in shapes"
                  :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>&nbsp;
              <el-button @click="toClip()" class="subNav-button">应用</el-button>
            </el-row>
            <el-row>
              <el-row v-if="maskShape == 'rect'">
                <!-- <el-button-group>
                  <el-button @click="resizeMask('1:1')" class="subNav-button" type="info" >1:1</el-button>
                  <el-button @click="resizeMask('3:2')" class="subNav-button" type="info" >3:2</el-button>
                  <el-button @click="resizeMask('4:3')" class="subNav-button" type="info" >4:3</el-button>
                  <el-button @click="resizeMask('16:9')" class="subNav-button" type="info" >16:9</el-button>
                  <el-button @click="resizeMask('2:3')" class="subNav-button" type="info" >2:3</el-button>
                  <el-button @click="resizeMask('3:4')" class="subNav-button" type="info" >3:4</el-button>
                  <el-button @click="resizeMask('9:16')" class="subNav-button" type="info" >9:16</el-button>
                </el-button-group>&nbsp;&nbsp; -->
                <el-select v-model="selectedScale" style="width: 120px;" @change="resizeMask(selectedScale)">
                <el-option v-for="item in scaleList"
                  :key="item" :label="item" :value="item"></el-option>
                </el-select>&nbsp;
                框的宽度&nbsp;
                <el-input-number class="inputStyle" v-model="maskWidth"
                  :precision="0" :controls="false" :min="1" ></el-input-number>&nbsp;
                <el-button icon="el-icon-lock" class="subNav-button" v-if="lockMaskScale==true" 
                  @click="lockMaskScale=false"></el-button>
                <el-button icon="el-icon-unlock" class="subNav-button unLock" v-else 
                  @click="lockMaskScale=true"></el-button>
                &nbsp;框的高度&nbsp;
                <el-input-number class="inputStyle" v-model="maskHeight" :precision="0"
                  :controls="false" :min="1" ></el-input-number>
              </el-row>
              <el-row v-else-if="maskShape == 'circle'">
                框的半径&nbsp;
                <el-input-number :precision="0" v-model="maskRadius"  :controls="false"
                  :min="1" :max="canvasHeight/2"></el-input-number>&nbsp;&nbsp;
              </el-row>
            </el-row>
            <el-row style="margin-bottom: 10px;">
              <el-button-group>
                <el-button @click="changeAngle('left')" class="subNav-button" type="info" >左旋转90</el-button>
                <el-button @click="changeAngle('right')" class="subNav-button" type="info" >右旋转90</el-button>
                <el-button @click="changeAngle('x')" class="subNav-button" type="info" >水平翻转</el-button>
                <el-button @click="changeAngle('y')" class="subNav-button" type="info" >垂直翻转</el-button>
              </el-button-group>
            </el-row>
          </el-row>
          <!-- <el-row class="sub-nav-box" v-else-if="state == 'resetSize'"
            type="flex"
            justify="center"
            style="margin:0 auto;margin-top:20px;">
            <el-col :md="1">
              <el-button @click="refreshSize()">取消</el-button>
            </el-col>
            <el-col :md="4">
              宽&nbsp;&nbsp;
              <el-input-number
                v-model="imgScaledWidth"
                class="inputStyle"
                :precision="0"
                :controls="false"
                :min="1"
                :max="imgWidth"
              ></el-input-number>
            </el-col>
            <el-col :md="1">
              <el-button
                icon="el-icon-lock"
                type="primary"
                v-if="lockImageScale==true"
                @click="lockImageScale=false"
              ></el-button>
              <el-button icon="el-icon-unlock" type="primary" v-else @click="lockImageScale=true"></el-button>
            </el-col>
            <el-col :md="4">
              高&nbsp;&nbsp;
              <el-input-number
                v-model="imgScaledHeight"
                class="inputStyle"
                :precision="0"
                :controls="false"
                :min="1"
                :max="imgWidth"
              ></el-input-number>
            </el-col>
            <el-col :md="1">
              <el-button @click="toResetSize()">应用</el-button>
            </el-col>
          </el-row>
          <el-row class="sub-nav-box" v-else-if="state == 'rotate'">
            <el-button-group>
              <el-button @click="restoreAngle()">取消</el-button>
              <el-button @click="changeAngle('left')">左旋转90</el-button>
              <el-button @click="changeAngle('right')">右旋转90</el-button>
              <el-button @click="changeAngle('x')">水平翻转</el-button>
              <el-button @click="changeAngle('y')">垂直翻转</el-button>
              <el-button @click="toRotate()">应用</el-button>
            </el-button-group>
          </el-row> -->
          <el-row class="sub-nav-box" v-else-if="state == 'filters'">
            <el-row type="flex" justify="center">
              <span class="filterName">亮度</span>
              <el-slider class="filterSlider" v-model="brightnessValue" :min="-1" :max="1" 
                :step="0.000001" @input="changeBrightness()" @change="saveJson()"></el-slider>
              <span class="filterName">对比度</span>
              <el-slider class="filterSlider" v-model="contrastValue" :min="-1" :max="1" 
                :step="0.000001" @input="changeContrast()" @change="saveJson()"></el-slider>
              <span class="filterName">饱和度</span>
              <el-slider class="filterSlider" v-model="saturationValue" :min="-1" :max="1"
                :step="0.000001" @input="changeSaturation()" @change="saveJson()"></el-slider>
              <span class="filterName">模糊度</span>
              <el-slider class="filterSlider" v-model="blurValue" :min="0" :max="1" 
                :step="0.000001" @input="changeBlur()" @change="saveJson()"></el-slider>
            </el-row>
            <el-row type="flex" justify="center">
              <span class="filterName">red</span>
              <el-slider class="filterSlider" v-model="gammaRedValue" :min="0.01" :max="2.2"
                :step="0.000001" @input="changeGamma('red')" @change="saveJson()"></el-slider>
              <span class="filterName">green</span>
              <el-slider class="filterSlider" v-model="gammaGreenValue" :min="0.01" :max="2.2"
                :step="0.000001" @input="changeGamma('green')" @change="saveJson()"></el-slider>
              <span class="filterName">blue</span>
              <el-slider class="filterSlider" v-model="gammaBlueValue" :min="0.01" :max="2.2"
                :step="0.000001" @input="changeGamma('blue')" @change="saveJson()"></el-slider>
              <span class="filterName">锐化</span>
              <el-slider class="filterSlider" v-model="sharpenValue"  @change="saveJson()"
                :min="1" :max="100" :step="1" @input="changeSharpen()"></el-slider>
            </el-row>
            <el-row type="flex" justify="center" style="margin-bottom:10px;">
              <el-button-group class="nav-button">
                <el-button icon="el-icon-refresh-left" :disabled="returnPrevious"
                  class="subNav-button" @click="returnBack('previous')">
                </el-button>
                <el-button icon="el-icon-refresh-right" :disabled="returnNext"
                  class="subNav-button" @click="returnBack('next')">
                </el-button>
              </el-button-group>&nbsp;&nbsp;
              <el-button @click="cancelFilters()" class="subNav-button">取消</el-button>
              <span class="filterName">模式</span>
              <el-select v-model="blendModeValue" @change="changeBlend('mode')" style="width:120px;margin: 0 15px;">
                <el-option v-for="item in blendModeList"
                  :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
              <span class="filterName">颜色</span>
              <el-color-picker v-model="blendColorValue" @change="changeBlend('color') "
                style="margin: 0 10px;"></el-color-picker>
              <el-slider class="filterSlider" v-model="blendAlphaValue" @change="saveJson()"
                :min="0" :max="1" :step="0.01" @input="changeBlend('alpha')"></el-slider>
              <el-button @click="saveFilters()" class="subNav-button">应用</el-button>
            </el-row>
          </el-row>
          <el-row class="sub-nav-box" v-if="state == 'watermark'" type="flex" justify="center">
            <el-button-group class="nav-button">
              <el-button icon="el-icon-refresh-left" :disabled="returnPrevious" type="info"
                class="subNav-button" @click="returnBack('previous')">
              </el-button>
              <el-button icon="el-icon-refresh-right" :disabled="returnNext" type="info"
                class="subNav-button" @click="returnBack('next')">
              </el-button>
            </el-button-group>&nbsp;&nbsp;
            <el-button @click="state=''" class="subNav-button" type="info">返回</el-button>
            <span class="filterName" style="width:100px;">水印透明度</span>
            <el-slider class="filterSlider" v-model=" opacityValue" :min="0" :max="1" 
              :step="0.001" @input="changeOpacity()" @change="saveJson()"></el-slider>
            <el-button @click="deleteWatermark()" class="subNav-button" type="info">删除</el-button>
          </el-row>
        </el-row>
        <div class="canvasDiv" id="canvasDiv" style="margin-top: 20px;">
          <canvas id="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
          <br />
          <img :src="imgSrc" id="img" style="display:none;" @load="init" />
          <img :src="imgSrc_clip" id="img_clip" style="display:none;" @load="init_clip" />
        </div>
      </el-col>
      <el-drawer title="" :visible.sync="drawer" size="20%">
        <el-upload
          :action="postUrl"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :file-list="imageList"
          list-type="picture">
          <el-button size="small" type="primary">上传图片</el-button>
          <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
        </el-upload>
      </el-drawer>
    </el-row>
  </div>
</template>
<script>
export default {
  props:{
    clientWidth: Number,
    clientHeight: Number,
    imgSrc: String,
  },
  data() {
    return {
      // 页面样式、逻辑相关变量
      state: "", // 记录正在进行的编辑模式
      adaptToWindow: true,
      drawer: false, // 右侧抽屉可见性
      postUrl: "https://jsonplaceholder.typicode.com/posts/",
      imageList: [
        { name: "圣诞帽.jpg", url: "../static/圣诞帽.png" },
        { name: "圣诞花环.png", url: "../static/圣诞花环.png" }
      ],
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
      maskShape: "rect", // 裁剪框的形状值,默认为矩形
      selectedScale: "原图比例",
      scaleList:[
        "原图比例", "1:1", "3:2", "4:3", "16:9", "2:3", "3:4", "9:16"
      ],

      // 画布交互的相关变量
      canvasWidth: document.body.clientWidth - 60,
      canvasHeight: document.body.clientHeight - 175,
      imgSrc_clip: "",
      btnSrc: "../static/del.png",

      jsonList: [], // 用json记录图片修改后的数据
      curIndex: -1, // 记录当前图片存在数组中的索引
      oldIndex: 0, // 记录图片更改前存在数组中的索引
      returnPrevious: true, // 上一步按钮禁用状态
      returnNext: true, // 下一步按钮禁用状态
      
      imgAngle: 0,
      curImgAngle: 0,
      rotating: false, // 记录是否旋转中
      moving: false, // 记录是否移动中
      toMoving: false, // 在mask中点击移动图片
      width: 0, // 记录当前点与顶点的距离
      height: 0,
      scaling: false, // 记录是否缩放了
      mousewheeling: false, // 是否鼠标滚轮中标志
      MAX_SIZE: 2, // 放大倍数

      watermarkGroup: [], // 存放水印的数组
      opacityValue: 0.5, // 水印不透明度
      image: new fabric.Image(),
      imgTop: 0,
      imgLeft: 0,
      imgWidth: 0,
      imgHeight: 0,
      imgScaledWidth: 0,
      imgScaledHeight: 0,
      imgScale: 0,
      lockImageScale: true,
      lockMaskScale: true,
      mask: new fabric.Rect(),
      maskWidth: 0,
      maskHeight: 0,
      maskRadius: 0,
      maskScale: 0,
      // 编辑后新图片的属性
      newImgLeft: 0,
      newImgTop: 0,
      newImgWidth: 0,
      newImgHeight: 0,
      newImgScaleX: 0,
      newImgScaleY: 0,

      brightness: 0, // 图片亮度
      brightnessValue: 0, // 图片亮度修改后的值
      contrast: 0,
      contrastValue: 0,
      saturation: 0,
      saturationValue: 0,
      blendColor: "#409EFF",
      blendMode: "add",
      blendModeList: [
        {
          value: "add",
          label: "加"
        },
        {
          value: "multiply",
          label: "乘"
        },
        {
          value: "subtract",
          label: "减去"
        },
        {
          value: "diff",
          label: "差异"
        },
        {
          value: "screen",
          label: "屏幕"
        },
        {
          value: "lighten",
          label: "减轻"
        },
        {
          value: "darken",
          label: "变暗"
        },
        {
          value: "overlay",
          label: "覆盖"
        },
        {
          value: "exclusion",
          label: "排除"
        },
        {
          value: "tint",
          label: "着色"
        }
      ],
      blendAlpha: 0,
      blendColorValue: "#409EFF",
      blendModeValue: "add",
      blendAlphaValue: 0,
      sharpen: 1,
      sharpenValue: 1,
      blur: 0,
      blurValue: 0,
      gammaRed: 1,
      gammaGreen: 1,
      gammaBlue: 1,
      gammaRedValue: 1,
      gammaGreenValue: 1,
      gammaBlueValue: 1,
    };
  },
  watch: {
    clientWidth: function() {
      if(this.adaptToWindow)
        this.getCanvasSize();
    },
    clientHeight: function() {
      if(this.adaptToWindow)
        this.getCanvasSize();
    },
    maskWidth: function() {
      // if (this.maskWidth > this.image.getScaledWidth())
      //   this.maskWidth = this.image.getScaledWidth();
      if (this.maskWidth > this.canvasWidth)
        this.maskWidth = this.canvas.width;
      this.mask.set("width", this.maskWidth);
      if (this.lockMaskScale) {
        this.maskHeight = this.maskWidth / this.maskScale;
        this.mask.set("height", this.maskHeight);
      }
      this.mask.setCoords();
      this.mask.center();
      this.mask.setCoords();
      this.canvas.renderAll();
    },
    maskHeight: function() {
      // if (this.maskHeight > this.image.getScaledHeight())
      //   this.maskHeight = this.image.getScaledHeight();
      if (this.maskHeight > this.canvasHeight)
        this.maskHeight = this.canvas.height;
      this.mask.set("height", this.maskHeight);
      if (this.lockMaskScale){
        if(this.maskHeight * this.maskScale > this.imgScaledWidth){
          this.maskWidth = this.imgScaledWidth;
        }else{
          this.maskWidth = this.maskHeight * this.maskScale;
        }
        this.mask.set("width", this.maskWidth);
      }
      this.mask.setCoords();
      this.mask.center();
      this.mask.setCoords();
      this.canvas.renderAll();
    },
    maskRadius: function() {
      var min;
      // if (this.image.getScaledWidth() > this.image.getScaledHeight()) {
      //   min = this.image.getScaledHeight();
      // } else {
      //   min = this.image.getScaledWidth();
      // }
      if (this.canvasWidth > this.canvasHeight) {
        min = this.canvasHeight;
      } else {
        min = this.canvasWidth;
      }
      if (this.maskRadius > min) this.maskRadius = min / 2;
      this.mask.set("radius", this.maskRadius);
      this.canvas.renderAll();
    },
    maskShape: function() {
      this.image.clipPath = new fabric.Rect({
        top: 0,
        left: 0,
        width: this.canvasWidth,
        height: this.canvasHeight,
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
      // this.mousewheelImage("on");
      // this.scaleMask("on");
    },
    curIndex: function() {
      if (this.curIndex > this.oldIndex) {
        this.returnPrevious = false;
      } else {
        this.returnPrevious = true;
      }
      if (this.curIndex < this.jsonList.length - 1) {
        this.returnNext = false;
      } else {
        this.returnNext = true;
      }
    },
    state: function() {
      if(this.state != "clip"){
        if(this.mask) this.canvas.remove(this.mask);
        this.mousewheelImage("off");
        this.scaleMask("off");
      }else if(this.state == "clip"){
        this.mousewheelImage("on");
        this.scaleMask("on");
      }
    },
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
          // width: img.width,
          // height: img.height,
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
      this.image.crossOrigin = "anonymous";
      this.refreshScale();
      this.image.setCoords();
      this.image.toObject = (function(toObject) {
        return function() {
          return fabric.util.object.extend(toObject.call(this), {
            name: this.name,
            scaledWidth: this.scaledWidth,
            scaledHeight: this.scaledHeight,
          });
        };
      })(this.image.toObject);
      this.canvas.add(this.image);
      this.image.name = "image";
      this.image.center();
      this.image.setCoords();
      this.mask.setCoords();
      this.canvas.preserveObjectStacking = true; // 禁止选中图层时自定义顶部
      this.canvas.selection = false;
      var max;
      if (this.image.width > this.image.height) {
        max = this.image.width;
      } else {
        max = this.image.height;
      }
      if (max > fabric.textureSize) {
        fabric.textureSize = max * 2;
      }
      fabric.filterBackend = fabric.initFilterBackend();
      this.canvas.renderAll();
      this.imgScale = this.image.width / this.image.height;
      this.newImgLeft = this.image.left;
      this.newImgTop = this.image.top;
      this.newImgWidth = this.image.getScaledWidth();
      this.newImgHeight = this.image.getScaledHeight();
      this.canvas.hoverCursor =
        'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAARCAMAAADnhAzLAAABKVBMVEUAAAAUFRfDw8TIyMggICEdHh8UFRfT1NVqamtycnOFhoYzNDVPUFBWVlcjJCYmJycsLC0eHyAuLy8oKCknKCknKCkUFRclJiYoKCgiIyTOzs/a2tqoqKjIycnMzMzd3d2urq85OTsvMDKxsbLV1dZCQkS4uLlQUFA7PD6JiYnKystXV1iJiYp3d3ifn6C4uLgfICK/v78kJSezs7Ofn59XV1hyc3OamppjY2MhISJRUVFGRkYjJCQyMzRHR0clJicUFRdHR0gXGBolJiccHR4tLS0lJicVFhgoKCktLS0cHR4XGBr////5+fn19fXt7e3s7Ozq6uri4uL7+/vv7+/o6Ojn5+fc3Nzy8vLw8PDd3t7Z2dnV1dXR0dLOzs7f39/W1ta/v7+vr6+SVJ4mAAAATHRSTlMA6d3b0os79+no4+PWz827sK2om5R1bVczKPj28/Dv7u7u7u3s7Ovr6Obl5ePj4uHg3tva2dnY1NHKxL+9ubi4tK2joJqHfnxiRyMUikpN3AAAANxJREFUGNNNy+V2wkAYhOFpSPCixeru7u7eb7NJGsHt/i+CZGE5PD/fMwOplMlVMKEM3NpXH493P7IUrl8wTaH0kjIjU56ffftJ5aG8TJ/rzkOSdlVDeSs8DYflc7pMMiOhK+l4/R7CBS3GyNyiE3VevwG0rIacScJCtBHJ4jfKd961OVH+W307XgIya2xz7ygoTLfNdgrAX2qZmCcKd6zDV/gqx7PipXPX8g6+EAgnIsGo5lhecyOMYds2/JHh1pu9U4wU94lVTavRihUhrVRZze1026sYe54aATAA+Pwr8I4RqnUAAAAASUVORK5CYII=") 8 8, auto';
      console.log("初始化图片");  
      this.toApplyFilters();
      this.blendColorValue = this.blendColor;
      this.blendModeValue = this.blendMode;
      this.blendAlphaValue = this.blendAlpha;
      this.gammaRedValue = this.gammaRed;
      this.gammaGreenValue = this.gammaGreen;
      this.gammaBlueValue = this.gammaBlue;
      this.blurValue = this.blur;
      this.sharpenValue = this.sharpen;
      this.saturationValue = this.saturation;
      this.contrastValue = this.contrast;
      this.brightnessValue = this.brightness;
      this.saveJson();
      this.scaleImage();
    },
    init_clip() {
      var self = this;
      if (this.imgSrc_clip != "") {
        this.image.setSrc(this.imgSrc_clip, function(img){
          self.image.set({
            left: self.newImgLeft,
            top: self.newImgTop,
            scaleX: self.newImgScaleX,
            scaleY: self.newImgScaleY,
            angle: self.imgAngle,
            width: self.newImgWidth,
            height: self.newImgHeight
          });
          self.canvas.renderAll();
          self.image.clipPath = new fabric.Rect({
            left: 0,
            top: 0,
            width: self.canvas.width,
            height: self.canvas.height,
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
          self.imgWidth = self.image.width;
          self.imgHeight = self.image.height;
          self.imgScale = self.image.width / self.image.height;
          self.image.setCoords();
          self.image.clipPath.setCoords();
          self.image.center();
          self.image.clipPath.center();
          self.image.setCoords();
          self.image.clipPath.setCoords();
          console.log("重载图片");
          self.canvas.renderAll();
          self.scaleImage();
          self.jsonList.splice(self.curIndex);
          self.saveJson();
          self.oldIndex = 0;
          self.returnPrevious = false;
          self.returnNext = true;
        });
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
      this.imgScaledWidth = Math.round(this.image.getScaledWidth());
      this.imgScaledHeight = Math.round(this.image.getScaledHeight());
      this.image.scaledWidth = this.imgScaledWidth;
      this.image.scaledHeight = this.imgScaledHeight;
      // this.imgScaledWidth = this.image.getScaledWidth();
      // this.imgScaledHeight = this.image.getScaledHeight();
    },

    // 裁剪相关方法
    chooseClip(){
      this.state = "clip";
      this.selectedScale = "原图比例";
      this.$nextTick(() => {
        var nav = document.getElementById("nav");
        var editor = document.getElementById("editor");
        this.canvasHeight = editor.clientHeight - nav.clientHeight - 40;
        this.canvas.setHeight(this.canvasHeight);
        // this.refreshScale();
        this.image.setCoords();
        this.image.center();
        this.image.setCoords();
        this.mask.center();
        this.mask.setCoords();
      })
      this.addMask();
      this.canvas.renderAll();
      this.saveJson();
      this.oldIndex = this.curIndex;
      this.imgScaledWidth = this.image.scaledWidth;
      this.imgScaledHeight = this.image.scaledHeight;
    },
    addMask() {
      if (this.mask) {
        this.canvas.remove(this.mask);
      }
      if (this.maskShape == "rect") {
        this.mask = new fabric.Rect({
          left: this.image.left,
          top: this.image.top,
          originX: "left",
          originY: "top",
          stroke: "#F5A623",
          strokeWidth: 3,
          cornerColor: "#F5A623",
          fill: "rgba(255, 255, 255, 0)",
          // fill: "#757575",
          // opacity: 0.6,
          objectCaching: false,
          // scaleX: this.image.scaleX,
          // scaleY: this.image.scaleY,
          // selectionBackgroundColor: "rgba(255, 255, 255, 0)",
          padding: 0,
          angle: this.image.angle,
          lockRotation: true,
          hasControls: false,
          lockMovementX: true,
          lockMovementY: true,
          selectable: false,
        });      
        this.mask.setCoords();
        this.mask.center();
        this.mask.setCoords();
        this.maskWidth = this.mask.width = this.image.getScaledWidth();
        this.maskHeight = this.mask.height = this.image.getScaledHeight();
        if (this.maskWidth > this.canvasWidth)
          this.maskWidth = this.canvas.width;
        this.mask.set("width", this.maskWidth);
        if (this.maskHeight > this.canvasHeight)
          this.maskHeight = this.canvas.height;
        this.mask.set("height", this.maskHeight);
        // this.mask.setCoords();
        this.mask.toObject = (function(toObject) {
          return function() {
            return fabric.util.object.extend(toObject.call(this), {
              name: this.name
            });
          };
        })(this.mask.toObject);
        this.canvas.add(this.mask);
        this.canvas.setActiveObject(this.image);
        this.maskScale = this.maskWidth / this.maskHeight;
      } else if (this.maskShape == "circle") {
        var min;
        if (this.image.getScaledWidth() > this.image.getScaledHeight()) {
          min = this.image.getScaledHeight();
        } else {
          min = this.image.getScaledWidth();
        }
        if (min > this.canvasHeight) {
          min = this.canvasHeight;
        }
        this.mask = new fabric.Circle({
          radius: min / 2,
          fill: "rgba(255, 255, 255, 0)",
          left: this.image.left,
          top: this.image.top,
          stroke: "#F5A623",
          strokeWidth: 3,
          lockRotation: true,
          hasControls: false,
          lockMovementX: true,
          lockMovementY: true,
          selectable: false,
        });
        this.mask.toObject = (function(toObject) {
          return function() {
            return fabric.util.object.extend(toObject.call(this), {
              name: this.name
            });
          };
        })(this.mask.toObject);
        this.mask.setControlsVisibility({
          mt: false,
          mr: false,
          mb: false,
          ml: false
        });
        this.canvas.add(this.mask);
        this.mask.setCoords();
        this.mask.center();
        this.mask.setCoords();
        this.canvas.setActiveObject(this.image);
        this.maskRadius = this.mask.radius;
        this.maskScale = 1;
      }
      this.mask.name = "mask";
      this.canvas.renderAll();
      this.maskWidth = this.mask.getScaledWidth();
      this.maskHeight = this.mask.getScaledHeight();
      this.newImgScaleX = 1;
      this.newImgScaleY = 1;
      this.moveImageInMask();
    },
    moveImageInMask(){
      var self = this;
      this.mask.on({
        mousedown: e => { 
          if(self.image.containsPoint(e.pointer)){
            self.toMoving = true;
            self.width = e.pointer.x - self.image.left;
            self.height = e.pointer.y - self.image.top;
            console.log("now point ("+ e.pointer.x + "," + e.pointer.y + ")");
            console.log("image point ("+ self.image.left + "," + self.image.top + ")");
            console.log("width: "+ self.width + " , height: " + self.height);
            self.canvas.setActiveObject(self.image);
          }else{
            self.toMoving = false;
            self.canvas.discardActiveObject();
          }
        },
        mouseup: e => {
          if(self.toMoving){
            console.log("now point ("+ e.pointer.x + "," + e.pointer.y + ")");
            self.imgLeft = e.pointer.x - self.width;
            self.imgTop = e.pointer.y - self.height;
            self.image.set('left', self.imgLeft);
            self.image.set('top', self.imgTop);
            self.image.setCoords();
            console.log("image point ("+ self.image.left + "," + self.image.top + ")");
            self.canvas.renderAll();
            self.toMoving = false;
            this.saveJson();
          }
        },
        mousemove: e => {
          if(self.toMoving){
            console.log("mousemove in mask");
            self.imgLeft = e.pointer.x - self.width;
            self.imgTop = e.pointer.y - self.height;
            self.image.set('left', self.imgLeft);
            self.image.set('top', self.imgTop);
            self.image.setCoords();
            self.canvas.renderAll();
          }
        },
        mousewheel: opt => {
          console.log("event mousewheel in mask");
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
          var clipWidth = this.mask.getScaledWidth();
          var clipHeight = this.mask.getScaledHeight();
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
          } else if (delta > 0 &&
            (width >= this.image.get("width") * this.MAX_SIZE ||
            height >= this.image.get("height") * this.MAX_SIZE)) {
          } else {
            this.image.scaleToWidth(width);
            this.keepPoint(opt, oriLeft, oriTop, oriWidth, oriHeight);
          }
          this.image.setCoords();
          this.mask.setCoords();
          this.canvas.renderAll();
          this.imgScaledWidth = this.image.getScaledWidth();
          this.imgScaledHeight = this.image.getScaledHeight();
          this.mousewheeling = false;
        }
      });
    },
    moveImageToCanvas(event){
      if(event.x > this.canvas._offset.left && event.x < this.canvas._offset.left + this.canvas.width &&
        event.y > this.canvas._offset.top && event.y < this.canvas._offset.top + this.canvas.height){    
        if(this.toMoving){
          debugger
          console.log("move image");
          console.log("now point ("+ event.offsetX + "," + event.offsetY + ")");
          this.imgLeft = event.offsetX - this.width;
          this.imgTop = event.offsetY - this.height;
          this.image.set('left', this.imgLeft);
          this.image.set('top', this.imgTop);
          this.image.setCoords();
          console.log("image point ("+ this.image.left + "," + this.image.top + ")");
          console.log("width: "+ this.width + " , height: " + this.height);
          this.canvas.renderAll();
          this.saveJson();
          this.toMoving = false;
        }
      }
    },
    cancelClip() {
      this.state = "";
      this.canvas.remove(this.mask);
      this.restoreAngle();
      this.jsonList.splice(this.oldIndex);
      this.curIndex = this.oldIndex;
      this.returnBack("previous");
      this.curIndex = this.oldIndex - 1; 
      this.canvas.remove(this.mask);  
      this.oldIndex = 0;
      this.$nextTick(() => {
        var nav = document.getElementById("nav");
        var editor = document.getElementById("editor");
        this.canvasHeight = editor.clientHeight - nav.clientHeight - 40;
        this.canvas.setHeight(this.canvasHeight);
        this.refreshScale();
        this.canvas.renderAll();
      })
    },
    // 选择裁剪框尺寸
    resizeMask(command) {
      this.lockMaskScale = true;
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
        this.maskScale = 1;
      } else{
        if( command == "原图比例"){
          this.maskScale = this.imgScale;
        }else if (command == "3:2") {
          this.maskScale = 3/2;
        } else if (command == "4:3") {
          this.maskScale = 4 / 3;
        } else if (command == "16:9") {
          this.maskScale = 16 / 9;
        } else if (command == "2:3") {
          this.maskScale = 2/3;
        } else if (command == "3:4") {
          this.maskScale = 3/4;
        } else if (command == "9:16") {
          this.maskScale = 9/16;
        }
        if(this.maskScale > 1){
          if (this.imgScale > this.maskScale) {
            this.mask.set("height", min / this.mask.scaleY);
            this.mask.set("width", this.maskScale * min);
          } else {
            if (this.imgScale >= 1) {
              this.mask.set("height", min / this.mask.scaleY);
              this.mask.set("width", this.maskScale * this.mask.height);
            } else {
              this.mask.set("width", min / this.mask.scaleX);
              this.mask.set("height", this.mask.width / this.maskScale);
            }
          }
        }else if(this.maskScale < 1){
          if (this.imgScale > this.maskScale) {
            if (this.imgScale >= 1) {
              this.mask.set("height", min / this.mask.scaleY);
              this.mask.set("width", this.maskScale * this.mask.height);
            } else {
              this.mask.set("width", min / this.mask.scaleX);
              this.mask.set("height", this.mask.width / this.maskScale);
            }
          } else {
            this.mask.set("width", min / this.mask.scaleX);
              this.mask.set("height", this.mask.width / this.maskScale);
          }
        }
      }
      this.mask.setCoords();
      this.mask.center();
      this.mask.setCoords();
      this.canvas.renderAll();
      this.maskWidth = this.mask.getScaledWidth();
      this.maskHeight = this.mask.getScaledHeight();
      console.log(this.maskScale);
      this.saveJson();
    },
    toClip() {
      this.state = "";
      this.$nextTick(() => {
        var nav = document.getElementById("nav");
        var editor = document.getElementById("editor");
        this.canvasHeight = editor.clientHeight - nav.clientHeight - 40;
        this.canvas.setHeight(this.canvasHeight);
        this.canvas.renderAll();
      })
      this.mask.setCoords();
      this.image.setCoords();
      this.newImgLeft = this.mask.left;
      this.newImgTop = this.mask.top;
      this.newImgWidth = this.maskWidth;
      this.newImgHeight = this.maskHeight;
      var radius = this.mask.radius;
      if (this.maskShape == "rect") {
        this.image.clipPath.set({
          top: this.newImgTop,
          left: this.newImgLeft,
          width: this.newImgWidth,
          height: this.newImgHeight
        });
        this.canvas.remove(this.mask);
        var img = this.canvas.toDataURL({
          format: "png",
          left: this.newImgLeft,
          top: this.newImgTop,
          width: this.newImgWidth,
          height: this.newImgHeight
        });
      } else if (this.maskShape == "circle") {
        this.image.clipPath = new fabric.Circle({
          top: this.newImgTop,
          left: this.newImgLeft,
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
          top: this.newImgTop,
          left: this.newImgLeft,
          radius: radius,
          width: this.newImgWidth,
          height: this.newImgHeight
        });
        this.canvas.remove(this.mask);
        var img = this.canvas.toDataURL({
          format: "png",
          left: this.newImgLeft,
          top: this.newImgTop,
          radius: radius,
          width: this.newImgWidth,
          height: this.newImgHeight
        });
      }
      this.imgAngle = 0;
      this.imgSrc_clip = img;
      this.curIndex = this.oldIndex;
      this.image.scaledHeight = this.maskHeight;
      this.image.scaledWidth = this.maskWidth;
      this.canvas.renderAll();
    },
    // 监听裁剪框的缩放
    scaleMask(command) {
      if (command == "on") {
        this.mask.on({
          scaling: e => {
            if (this.maskShape == "rect") {
              this.maskWidth = this.mask.getScaledWidth();
              this.maskHeight = this.mask.getScaledHeight();
            } else if (this.maskShape == "circle") {
              this.maskRadius = this.mask.getRadiusX();
              this.maskWidth = this.mask.getScaledWidth();
              this.maskHeight = this.mask.getScaledHeight();
            }
            console.log("mask is scaling");
          }
        });
      } else if (command == "off") {
        this.image.off("scaling");
      }
    },
    // 监听鼠标滚轮缩放图片
    mousewheelImage(command) {
      if (command == "on") {
        var self = this;
        console.log("mousewheel on");
        this.image.on({
          mousewheel: opt => {
            console.log("event mousewheel in image");
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
            // var width = (oriWidth = this.imgScaledWidth);
            // var height = (oriHeight = this.imgScaledHeight);
            var oriLeft = this.image.get("left");
            var oriTop = this.image.get("top");
            // var clipWidth = this.imgScaledWidth;
            // var clipHeight = this.imgScaledHeight;
            var clipWidth = this.mask.getScaledWidth();
            var clipHeight = this.mask.getScaledHeight();
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
            } else if (delta > 0 &&
              (width >= this.image.get("width") * this.MAX_SIZE ||
                height >= this.image.get("height") * this.MAX_SIZE)) {
            } else {
              this.image.scaleToWidth(width);
              this.keepPoint(opt, oriLeft, oriTop, oriWidth, oriHeight);
            }
            this.image.setCoords();
            this.mask.setCoords();
            this.canvas.renderAll();
            this.imgScaledWidth = this.image.getScaledWidth();
            this.imgScaledHeight = this.image.getScaledHeight();
            this.mousewheeling = false;
          }
        });   
      } else if (command == "off") {
        this.image.off("mousewheel");
        console.log("mousewheel off");
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
    }, 
    changeImgScaledWidth(){
      this.image.set('scaleX', this.imgScaledWidth / this.image.width);
      this.image.scaledWidth = this.imgScaledWidth;
      if (this.lockImageScale && !this.mousewheeling) {
        this.imgScaledHeight = this.imgScaledWidth / this.imgScale;
        this.image.scaledHeight = this.imgScaledHeight;
        this.image.set('scaleY', this.imgScaledHeight / this.image.height);
      }
      this.canvas.renderAll();
      this.saveJson();
    },
    changeImgScaledHeight(){
      this.image.scaledHeight = this.imgScaledHeight;
      this.image.set('scaleY', this.imgScaledHeight / this.image.height);
      if (this.lockImageScale && !this.mousewheeling) {
        this.imgScaledWidth = this.imgScaledHeight * this.imgScale;
        this.image.scaledWidth = this.imgScaledWidth;
        this.image.set('scaleX', this.imgScaledWidth / this.image.width);
      }
      this.canvas.renderAll();
      this.saveJson();
    },
    // 监听图片事件
    scaleImage() {
      console.log("listening image");
      var self = this;
      this.image.on({
        scaling: e => {
          self.rotating = false;
          self.lockImageScale = false;
          self.scaling = true;
          self.imgScaledWidth = self.image.getScaledWidth();
          self.imgScaledHeight = self.image.getScaledHeight();
        },
        scaled: e => {
          self.imgScaledWidth = self.image.getScaledWidth();
          self.imgScaledHeight = self.image.getScaledHeight();
          console.log(self.imgScaledWidth + "," + self.imgScaledHeight);
          console.log(this.imgScaledWidth + "," + this.imgScaledHeight);
          self.saveJson();
        },
        mousedown: e =>{
          self.imgTop = self.image.top;
          self.imgLeft = self.image.left;
          console.log("curren point ("+ e.pointer.x + "," + e.pointer.y + ")");
          if(!self.image.containsPoint(e.pointer)){
            self.rotating = true;
          }
        },
        mouseup: e=>{        
          if(self.rotating){
            console.log("rotate  ("+ e.pointer.x + "," + e.pointer.y + ")");
            self.saveJson();
            self.rotating = false;
          }else{
            if(self.imgTop != self.image.top || self.imgLeft != self.image.left){
              self.moving = true;
            }
            if((!self.scaling) && self.moving){   
              self.moving = false;
              self.saveJson();
            }
          }
          self.scaling = false;
        }
      }); 
         
    },
    // 改变尺寸（缩放）相关方法
    toResetSize() {
      if (this.lockImageScale) {
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
          this.image.set("scaleX", this.imgScaledWidth / this.image.width);
          this.image.set("scaleY", this.imgScaledHeight / this.image.height);
        } else {
          this.image.set("scaleX", this.imgScaledWidth / this.image.width);
          this.image.set("scaleY", this.imgScaledHeight / this.image.height);
        }
      }
      this.newImgWidth = this.imgScaledWidth;
      this.newImgHeight = this.imgScaledHeight;
      this.newImgScaleX = 1;
      this.newImgScaleY = 1;
      var newImg = this.canvas.toDataURL({
        format: "png",
        multiplier: this.newImgWidth / this.image.getScaledWidth(),
        top: this.image.top,
        left: this.image.left,
        width: this.newImgWidth,
        height: this.newImgHeight
      });
      this.imgSrc_clip = newImg;
      this.image.setCoords();
      this.image.center();
      this.canvas.renderAll();
      this.imgScaledWidth = this.image.getScaledWidth();
      this.imgScaledHeight = this.image.getScaledHeight();
      this.newImgLeft = this.image.left;
      this.newImgTop = this.image.top;
      this.state = "";
    },

    // 选择旋转方式
    changeAngle(command) {
      this.curImgAngle = this.image.angle;
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
          this.newImgScaleX *= -1;
        } else {
          this.image.set("scaleY", -1);
          this.newImgScaleY *= -1;
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
          this.newImgScaleY *= -1;
        } else {
          this.image.set("scaleX", -1);
          this.newImgScaleX *= -1;
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
        // 图片垂直向
        this.imgHeight = this.image.width;
        this.imgWidth = this.image.height;
        if (this.imgWidth > this.canvas.width) {
          this.image.scaleToHeight(this.canvas.width);
        }
        if (this.image.getScaledWidth() >= this.canvas.height) {
          this.image.scaleToWidth(this.canvas.height);
        }
        // var temp = this.image.getScaledWidth();
        // this.imgScaledWidth = this.image.getScaledHeight();
        // this.imgScaledHeight = temp;
        // this.mask.set("width", this.image.getScaledHeight());
        // this.mask.set("height", this.image.getScaledWidth());
      } else {
        this.imgHeight = this.image.height;
        this.imgWidth = this.image.width;
        // 重设图片的缩放比例
        this.image.scaleToWidth(this.imgScaledWidth);
        this.image.scaleToHeight(this.imgScaledHeight);
        this.refreshScale();
        // this.imgScaledWidth = this.image.getScaledWidth();
        // this.imgScaledHeight = this.image.getScaledHeight();
        // this.mask.set("width", this.image.getScaledWidth());
        // this.mask.set("height", this.image.getScaledHeight());
      }
      this.image.setCoords();
      this.image.center();
      this.canvas.renderAll();
      // this.saveJson();
    },
    // 取消角度的变化
    restoreAngle() {
      this.state = "";
      this.canvas.remove(this.mask);
      this.image.set("angle", this.imgAngle);
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
        this.refreshScale();
      }
      this.image.setCoords();
      this.image.center();
      this.canvas.renderAll();
    },

    // 图像滤镜相关方法
    applyFilter(index, filter) {
      this.image.filters[index] = filter;
      this.image.applyFilters();
      this.canvas.renderAll();
    },
    getFilter(index) {
      return this.image.filters[index];
    },
    applyFilterValue(index, prop, value) {
      if (this.image.filters[index]) {
        console.log("change");
        this.image.filters[index][prop] = value;
        this.image.applyFilters();
        this.canvas.renderAll();
      }
    },
    chooseFilters(){
      this.oldIndex = this.curIndex;
      this.state='filters';
      this.$nextTick(() => {
        var nav = document.getElementById("nav");
        var editor = document.getElementById("editor");
        this.canvasHeight = editor.clientHeight - nav.clientHeight - 40;
        this.canvas.setHeight(this.canvasHeight);
        this.image.setCoords();
        this.image.center();
        this.image.setCoords();
      })
    },
    toApplyFilters(){
      this.applyFilter(0, new fabric.Image.filters.Brightness({
          brightness: parseFloat(this.brightness)
        })
      );
      this.applyFilter(1, new fabric.Image.filters.Contrast({
          contrast: parseFloat(this.contrast)
        })
      );
      this.applyFilter(2, new fabric.Image.filters.Saturation({
          saturation: parseFloat(this.saturation)
        })
      );
      this.applyFilter(3, new fabric.Image.filters.Blur({
          value: parseFloat(this.blur)
        })
      );
      this.applyFilter(4, new fabric.Image.filters.Gamma({
          gamma: [this.gammaRed, this.gammaGreen, this.gammaBlue]
        })
      );
      this.applyFilter(5, new fabric.Image.filters.Convolute({
          matrix: [0, 0, 0, 0, 1, 0, 0, 0, 0]
        })
      );
      this.applyFilter(6, new fabric.Image.filters.BlendColor({
          color: this.blendColor,
          mode: this.blendMode,
          alpha: this.blendAlpha
        })
      );
    },
    cancelFilters(){
      this.state = "";
      this.canvas.remove(this.mask);
      this.curIndex = this.oldIndex + 1;
      this.returnBack("previous");
      this.curIndex = this.oldIndex;
      this.jsonList.splice(this.curIndex + 1);
      this.canvas.remove(this.mask);
      this.oldIndex = 0;
      this.$nextTick(() => {
        var nav = document.getElementById("nav");
        var editor = document.getElementById("editor");
        this.canvasHeight = editor.clientHeight - nav.clientHeight - 40;
        this.canvas.setHeight(this.canvasHeight);
        this.refreshScale();
        this.canvas.renderAll();
      })
    },
    saveFilters(){
      this.state = "";
      this.$nextTick(() => {
        var nav = document.getElementById("nav");
        var editor = document.getElementById("editor");
        this.canvasHeight = editor.clientHeight - nav.clientHeight - 40;
        this.canvas.setHeight(this.canvasHeight);
        this.brightness = this.brightnessValue;
        this.contrast = this.contrastValue;
        this.saturation = this.saturationValue;
        this.sharpen = this.sharpenValue;
        this.blur = this.blurValue;
        this.gammaRed = this.gammaRedValue;
        this.gammaGreen = this.gammaGreenValue;
        this.gammaBlue = this.gammaBlueValue;
        this.blendColor = this.blendColorValue;
        this.blendMode = this.blendModeValue;
        this.blendAlpha = this.blendAlphaValue;
        this.curIndex = this.oldIndex;
        this.jsonList.splice(this.curIndex + 1);
        this.saveJson();
        this.oldIndex = 0;
      })
    },
    // 亮度
    changeBrightness() {
      this.applyFilterValue(0, "brightness", parseFloat(this.brightnessValue));
    },
    // 对比度
    changeContrast() {
      this.applyFilterValue(1, "contrast", parseFloat(this.contrastValue));
    },
    // 饱和度
    changeSaturation() {
      this.applyFilterValue(2, "saturation", parseFloat(this.saturationValue));
    },
    // 混合颜色
    changeBlend(prop) {
      if (prop == "color")
        this.applyFilterValue(6, "color", this.blendColorValue);
      else if (prop == "mode")
        this.applyFilterValue(6, "mode", this.blendModeValue);
      else if (prop == "alpha")
        this.applyFilterValue(6, "alpha", parseFloat(this.blendAlphaValue));
    },
    // 锐化
    changeSharpen() {
      var a = -(this.sharpenValue - 1) / 4;
      this.applyFilterValue(5, "matrix", [
        0,
        a,
        0,
        a,
        this.sharpenValue,
        a,
        0,
        a,
        0
      ]);
      console.log(
        "[ 0, " +
          a +
          ", 0, " +
          a +
          ", " +
          this.sharpenValue +
          ", " +
          a +
          ", 0, " +
          a +
          ", 0 ]"
      );
    },
    // 伽马
    changeGamma(color) {
      this.applyFilterValue(4, "gamma", [this.gammaRedValue, this.gammaGreenValue, this.gammaBlueValue]);
    },
    // 模糊
    changeBlur() {
      this.applyFilterValue(3, "blur", parseFloat(this.blurValue));
    },

    // 保存图片
    save() {
      this.state = "";
      this.image.clipPath.set({
        top: this.image.top,
        left: this.image.left,
        width: this.image.width,
        height: this.image.height
      });
      for (var i = 0; i < this.watermarkGroup.length; i++) {
        this.watermarkGroup[i].btn.set("visible", false);
      }
      var newImg = this.canvas.toDataURL({
        format: "png",
        multiplier: this.image.width / this.image.getScaledWidth(),
        top: this.image.top,
        left: this.image.left,
        width: this.image.getScaledWidth(),
        height: this.image.getScaledHeight()
      });
      this.imgSrc_clip = newImg;
      for (var i = 0; i < this.watermarkGroup.length; i++) {
        this.canvas.remove(this.watermarkGroup[i].watermark);
      }
      this.watermarkGroup.splice(0, this.watermarkGroup.length);
      this.newImgLeft = this.image.left;
      this.newImgTop = this.image.top;
      // if (this.newImgTop < 0) this.newImgTop = 0;
      // if (this.newImgLeft < 0) this.newImgLeft = 0;
      this.newImgWidth = this.image.width;
      this.newImgHeight = this.image.height;
      this.newImgScaleX = this.image.scaleX;
      this.newImgScaleY = this.image.scaleY;
      this.brightness = this.contrast = this.saturation = this.blendAlpha = this.blur = 0;
      this.brightnessValue = this.contrastValue = this.saturationValue = this.blendAlphaValue = this.blurValue = 0;
      this.gammaRed = this.gammaGreen = this.gammaBlue = this.sharpen = 1;
      this.gammaRedValue = this.gammaGreenValue = this.gammaBlueValue = this.sharpenValue = 1;
      this.jsonList.length = 0;
      this.curIndex = -1;
      console.log("保存图片");
      this.canvas.renderAll();
    },
    // 上传图片
    handleRemove(image, imageList) {
      console.log(image, imageList);
    },
    handlePreview(image) {
      console.log(image);
      // this.drawer = false;
      this.addImage(image.url);
    },
    addImage(url) {
      var img = new Image();
      img.src = url;
      var delBtn = new Image();
      delBtn.src = this.btnSrc;
      var watermark, btn;
      watermark = new fabric.Image(img, {
        left: 0,
        top: 0,
        width: 200,
        height: 200,
        opacity: 0.5
      });
      watermark.toObject = (function(toObject) {
        return function() {
          return fabric.util.object.extend(toObject.call(this), {
            name: this.name
          });
        };
      })(watermark.toObject);
      watermark.setCoords();
      watermark.center();
      watermark.setCoords();
      for (var i = 0; i < this.watermarkGroup.length; i++) {
        this.watermarkGroup[i].btn.set("visible", false);
      }
      // btn = new fabric.Image(delBtn, {
      //   left: watermark.left + watermark.width - 30,
      //   top: watermark.top + 10,
      //   width: 20,
      //   height: 20,
      //   visible: true,
      //   hasControls: false,
      //   lockMovementX: true,
      //   lockMovementY: true,
      //   lockScalingFlip: true
      // });
      // btn.toObject = (function(toObject) {
      //   return function() {
      //     return fabric.util.object.extend(toObject.call(this), {
      //       name: this.name
      //     });
      //   };
      // })(btn.toObject);
      // btn.setCoords();
      // this.canvas.add(watermark, btn);
      this.canvas.add(watermark);
      watermark.name = "watermark";
      // btn.name = "btn";
      this.canvas.setActiveObject(watermark);
      this.canvas.renderAll();
      this.watermarkGroup.push({ watermark: watermark});
      // this.clickBtn(watermark);
      this.watermarkListener(watermark);
      this.saveJson();
      this.state = "watermark";
    },
    // 调节水印透明度
    changeOpacity(){
      var object = this.canvas.getActiveObject();
      if(object.name == 'watermark'){
        object.set('opacity', this.opacityValue);
        this.canvas.renderAll();
      }
    },
    // 监听水印
    watermarkListener(watermark) {
      watermark.on({
        scaling: e => {
          // btn.set("top", watermark.top + 10);
          // btn.set("left", watermark.left + watermark.getScaledWidth() - 30);
          // btn.setCoords();
          // this.canvas.renderAll();  
        },
        mousedown: e => {
          this.state = "watermark";
          this.opacityValue = watermark.opacity;
          this.canvas.setActiveObject(watermark);
          // if (
          //   !(btn.left <= e.pointer.x && e.pointer.x <= btn.left + btn.width &&
          //     btn.top <= e.pointer.y && e.pointer.y <= btn.top + btn.height)
          // ) {
          //   for (var i = 0; i < this.watermarkGroup.length; i++) {
          //     this.watermarkGroup[i].btn.set("visible", false);
          //   }
          // } else {
          //   for (var i = 0; i < this.watermarkGroup.length; i++) {
          //     if (this.watermarkGroup[i].watermark == watermark) {
          //       this.watermarkGroup.splice(i, 1);
          //       break;
          //     }
          //   }
          //   this.canvas.remove(watermark, btn);
          //   this.saveJson();
          //   if(this.watermarkGroup.length == 0){
          //     this.state = '';
          //   }
          // }
          // this.canvas.renderAll();
        },
        mouseup: e => {
          // this.opacityValue = watermark.opacity;
          // if (!(watermark.left + watermark.getScaledWidth() - 30 < e.pointer.x &&
          //   e.pointer.x < watermark.left + watermark.getScaledWidth() - 10 &&
          //   watermark.top + 10 < e.pointer.y && e.pointer.y < watermark.top + 30)) {
          //   var pointer = watermark.aCoords.tr;
          //   if(watermark.angle <= 30 && watermark.angle >= 0){
          //     btn.set("top", pointer.y + 10);
          //     btn.set("left", pointer.x - 30);
          //   }else if(watermark.angle <= 90 && watermark.angle > 30){
          //     btn.set("top", pointer.y - 15);
          //     btn.set("left", pointer.x - 30);
          //   }else if(watermark.angle <= 120 && watermark.angle > 90){
          //     btn.set("top", pointer.y - 30);
          //     btn.set("left", pointer.x - 30);
          //   }else if(watermark.angle <= 150 && watermark.angle > 120){
          //     btn.set("top", pointer.y - 30);
          //     btn.set("left", pointer.x - 15);
          //   }else if(watermark.angle <= 180 && watermark.angle > 150){
          //     btn.set("top", pointer.y - 30);
          //     btn.set("left", pointer.x + 10);
          //   }else if(watermark.angle <= 210 && watermark.angle > 180){
          //     btn.set("top", pointer.y - 15);
          //     btn.set("left", pointer.x + 10);
          //   }else if(watermark.angle <= 245 && watermark.angle > 210){
          //     btn.set("top", pointer.y - 15);
          //     btn.set("left", pointer.x + 10);
          //   }else if(watermark.angle <= 270 && watermark.angle > 245){
          //     btn.set("top", pointer.y + 10);
          //     btn.set("left", pointer.x + 10);
          //   }else if(watermark.angle <= 300 && watermark.angle > 270){
          //     btn.set("top", pointer.y + 15);
          //     btn.set("left", pointer.x + 10);
          //   }else if(watermark.angle <= 360 && watermark.angle > 300){
          //     btn.set("top", pointer.y + 10);
          //     btn.set("left", pointer.x - 15);
          //   }
          //   console.log(watermark.angle);
          // }
          // btn.set("visible", true);
          // btn.setCoords();
          // this.canvas.renderAll();
          this.saveJson();
        },
        mouseout: e => {
          // btn.set("visible", false);
        },
        selected: e => {
          this.state = "watermark";
          this.opacityValue = watermark.opacity;
        },
      });
    },
    deleteWatermark(){
      var object = this.canvas.getActiveObject();
      if(object.name == 'watermark'){
        this.state = "";
        for (var i = 0; i < this.watermarkGroup.length; i++) {
          if (this.watermarkGroup[i].watermark == object) {
            this.watermarkGroup.splice(i, 1);
            break;
          }
        }
        this.canvas.remove(object);
        this.saveJson();
        if(this.watermarkGroup.length == 0){
          this.state = '';
        }
      }
    },
    clickBtn(watermark, btn) {
      btn.on({
        mousedown: e => {
          for (var i = 0; i < this.watermarkGroup.length; i++) {
            if (this.watermarkGroup[i].watermark == watermark) {
              this.watermarkGroup.splice(i, 1);
              break;
            }
          }
          // debugger
          this.canvas.remove(watermark, btn);
          console.log("delete");
          this.saveJson();
        }
      });
    },
    // 保存图片数据
    saveJson() {   
      if (this.curIndex == 0 && this.jsonList.length > 1) {
        this.jsonList.splice(1);
      }
      this.jsonList.push(this.canvas.toJSON());
      this.curIndex = this.jsonList.length - 1;
      console.log(this.jsonList);
    },
    // 回退
    returnBack(command) {
      // this.jsonList[this.curIndex] = this.canvas.toJSON();
      if (command == "previous") {
        this.curIndex -= 1;
      } else if (command == "next") {
        this.curIndex += 1;
      }
      var self = this;
      var currentObj = this.jsonList[this.curIndex];
      this.watermarkGroup.splice(0);
      this.canvas.loadFromJSON(currentObj,this.canvas.renderAll.bind(this.canvas),
        function(o, object) {   
          // debugger 
          if (object.name) {
            if (object.name == "watermark") {
              var watermark = object;
              watermark.toObject = (function(toObject) {
                return function() {
                  return fabric.util.object.extend(toObject.call(this), {
                    name: this.name
                  });
                };
              })(watermark.toObject);
              watermark.name = 'watermark';
              self.watermarkGroup.push({
                watermark: watermark,
                btn: new fabric.Image()
              });
              self.watermarkListener(watermark);
            } else if (object.name == "btn") {
              var btn = object;
              btn.toObject = (function(toObject) {
                  return function() {
                    return fabric.util.object.extend(toObject.call(this), {
                      name: this.name
                    });
                  };
                })(btn.toObject);
              btn.name = 'btn';
              var temp = self.watermarkGroup[self.watermarkGroup.length - 1];
              temp.btn = btn;
              temp.btn.set('visible', false);
              self.watermarkListener(temp.watermark, temp.btn);
              self.clickBtn(temp.watermark, temp.btn);
            } else if (object.name == "mask") {
              self.mask = object;
              self.mask.toObject = (function(toObject) {
                return function() {
                  return fabric.util.object.extend(toObject.call(this), {
                    name: this.name
                  });
                };
              })(self.mask.toObject);
              self.mask.name = 'mask';
              self.maskWidth = self.mask.getScaledWidth();
              self.maskHeight = self.mask.getScaledHeight();
              self.mask.set({
                lockMovementX: true,
                lockMovementY: true,
                lockRotation: true,
                hasControls: false,
                selectable: false,
              })
              self.mask.setCoords();
              self.mask.center();
              self.mask.setCoords();
              self.moveImageInMask();
              self.scaleMask("on");
              self.maskScale = self.maskWidth / self.maskHeight;
            } else if(object.name == "image"){
              self.image.scaledWidth = object.scaledWidth;
              self.image.scaledHeight = object.scaledHeight;    
              self.image = object;
              self.image.toObject = (function(toObject) {
                return function() {
                  return fabric.util.object.extend(toObject.call(this), {
                    name: this.name,
                    scaledWidth: this.scaledWidth,
                    scaledHeight: this.scaledHeight,
                  });
                };
              })(self.image.toObject);
              self.image.name = 'image';
              self.image.clipPath.set({
                top: 0,
                left: 0,
                width: self.canvasWidth,
                height: self.canvasHeight
              });
              self.scaleImage();
              // self.mousewheelImage("on");
              self.imgScaledWidth = self.image.scaledWidth;
              self.imgScaledHeight = self.image.scaledHeight; 
              if(self.image.filters[0])
                self.brightnessValue = self.image.filters[0].brightness;
              if(self.image.filters[1])
                self.contrastValue = self.image.filters[1].contrast;
              if(self.image.filters[2])
                self.saturationValue = self.image.filters[2].saturation;
              if(self.image.filters[3])
                self.blurValue = self.image.filters[3].value;
              if(self.image.filters[5])
                self.sharpenValue = self.image.filters[5].matrix[4];
              if(self.image.filters[6])
                self.blendColorValue = self.image.filters[6].color;
              if(self.image.filters[6])
                self.blendModeValue = self.image.filters[6].mode;
              if(self.image.filters[6])
                self.blendAlphaValue = self.image.filters[6].alpha;
              if(self.image.filters[4])
                self.gammaRedValue = self.image.filters[4].gamma[0];
              if(self.image.filters[4])
                self.gammaGreenValue = self.image.filters[4].gamma[1];
              if(self.image.filters[4])
                self.gammaBlueValue = self.image.filters[4].gamma[2];
            }
          }
        } 
      );
      this.canvas.renderAll();
    },
    // 画布动态适应
    getCanvasSize(){
      console.log("window resize");
      var self = this;
      if(self.canvas){
        this.$nextTick(() => {
          var nav = document.getElementById("nav");
          var editor = document.getElementById("editor");
          self.canvasWidth = editor.clientWidth - 60;
          self.canvasHeight = editor.clientHeight - nav.clientHeight - 40;
          self.canvas.setWidth(self.canvasWidth);
          self.canvas.setHeight(self.canvasHeight);
          // self.refreshScale();
          var that = self;
          self.image.setSrc(that.image.getSrc(), function(){ 
            that.image.clipPath.set({
              top: 0,
              left: 0,
              width: that.canvasWidth,
              height: that.canvasHeight
            });
            that.image.name = "image";
            that.refreshScale();
            that.image.setCoords();
            that.image.center();
            that.image.setCoords(); 
            if(that.state == "clip"){
              that.mask.name = "mask";
              that.mask.set('width', that.image.getScaledWidth());
              that.mask.set('height', that.image.getScaledHeight());
              that.mask.setCoords();
              that.mask.center();
              that.mask.setCoords();
            }
            that.canvas.renderAll();
            console.log(that.image.clipPath.width + " , " + that.image.clipPath.height)
            console.log("图片的宽高：" + that.image.getScaledWidth() + " , " + that.image.getScaledHeight())
          });
          self.image.setCoords();
          self.image.center();
          self.image.setCoords(); 
          self.canvas.renderAll();
          self.jsonList[self.curIndex] = self.canvas.toJSON();
        })
      }
    },
    debounce(fn, wait){
      var timeout = null;    
      return function() {        
        if(timeout !== null)   clearTimeout(timeout);        
        timeout = setTimeout(fn, wait);    
      }
    }
  },
  mounted() {
    console.log("组件接收到的值" + this.clientWidth + "," + this.clientHeight);
    var nav = document.getElementById("nav");
    var editor = document.getElementById("editor");
    this.canvasWidth = editor.clientWidth - 60;
    this.canvasHeight = editor.clientHeight - nav.clientHeight - 40;
    // this.canvasWidth = this.clientWidth - 60;
    // this.canvasHeight = this.clientHeight - nav.clientHeight - 40;
    window.addEventListener('mouseup', this.moveImageToCanvas);
    // window.addEventListener('resize', this.debounce(this.getCanvasSize, 500));
  },
  beforeDestroy() {
    window.removeEventListener('mouseup', this.moveImageToCanvas);
  }
};
</script>

<style scoped>
.editor {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin: 0 auto;
  color: #fff;
  /* width: 100%;
  height: 100%; */
}

.nav-box {
  margin: 0 auto;
  background-color: #606266;
  border-bottom: 1px solid #303133;
  /* width: 100%; */
}

.disable {
  background-color: #53555a;
  color: #777a80;
  border: none;
}

.left-button {
  border: none;
  background-color: #333538;
  color: #fff;
}

.left-button:hover {
  background-color: #434447;
}

.right-button {
  border: 0px;
  background-color: #333538;
  color: #fff;
}

.sub-nav-box {
  margin: 0 auto;
  background-color: #606266;
  border-bottom: 1px solid #303133;
  min-width: 1010px;
}

.nav-button {
  background-color: #606266;
  border: none;
  color: white;
}

.nav-button:hover{
  background-color: #3c3e40
}

.subNav-button {
  background-color: #303133;
  border: none;
  color: white;
}

.subNav-button:hover {
  background-color: #434447;
}

.unLock {
  background-color: #434447;
}

.sub-nav-box .el-row {
  margin-top: 10px;
}

.nav-box /deep/ .el-button:active {
  background-color: #53555c !important;
}

.nav-box /deep/ .el-switch__label{
  color: #fff;
}

.inputStyle {
  width: 120px;
} 

.text {
  margin-top: 8px;
  text-align: right;
} 

.filterName {
  margin-top: 8px;
  width: 48px;
  text-align: right;
}

.filterSlider {
  width: 140px;
  margin: 0 15px;
}

.canvasDiv {
  margin: 0 auto;
}

.canvasDiv /deep/ .canvas-container{
  margin: 0 auto;
  height: 100%;
}

canvas {
  border: 1px dashed black;
  margin: 0 auto;
}

.filterSlider /deep/ .el-slider__runway {
  background-color: #3c3e40;
}

.filterSlider /deep/ .el-slider__bar {
  background-color: #fff;
}

.filterSlider /deep/ .el-slider__button {
  border: 2px solid #393a3b;
}

.content /deep/ .el-drawer__header {
  margin: 0;
}
</style>

