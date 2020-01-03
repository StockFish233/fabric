<template>
  <div id="app">
    <el-row>
      <el-col :md="24">
        <el-row>oldIndex：{{oldIndex}}，当前：{{curIndex}}，总：{{jsonList.length}}
          <el-button-group>
            <el-button icon="el-icon-refresh-left"
              type="primary" :disabled="returnPrevious"
              @click="returnBack('previous')"></el-button>
            <el-button icon="el-icon-refresh-right"
              type="primary" :disabled="returnNext"
              @click="returnBack('next')"></el-button>
          </el-button-group>
          <el-button-group>
            <el-button type="primary" @click="addMask()">裁剪</el-button>
            <!-- <el-button type="primary" @click="chooseResetSize()">尺寸</el-button>
            <el-button type="primary" @click="addRotateMask()">旋转</el-button> -->
            <el-button type="primary" @click="chooseFilters()">色彩</el-button>
            <!-- <el-button type="primary" @click="chooseBrightness()">亮度</el-button>
            <el-button type="primary" @click="chooseContrast()">对比度</el-button>
            <el-button type="primary" @click="chooseSaturation()">饱和度</el-button>
            <el-button type="primary" @click="chooseBlendColor()">混合颜色</el-button>
            <el-button type="primary" @click="chooseSharpen()">锐化</el-button>
            <el-button type="primary" @click="chooseGamma()">伽马</el-button>
            <el-button type="primary" @click="chooseBlur()">模糊</el-button> -->
            <el-button type="primary" @click="drawer = true">添加图片</el-button>
          </el-button-group>
          <el-button type="primary" @click="save()">保存</el-button>
        </el-row>
        <el-row v-if="state == 'clip'">
          <el-row type="flex" justify="center">
            <el-col :md="1">
              <el-button @click="removeMask()">取消</el-button>
            </el-col>
            <el-col :md="3">目前图片的宽&nbsp;&nbsp;
              <el-input-number v-model="imgScaledWidth" class="inputStyle" :precision="0" @change="changeImgScaledWidth()"
                :min="1"  :controls="false"></el-input-number>
            </el-col>
            <el-col :md="1">
              <el-button icon="el-icon-lock" type="primary" v-if="lockImageScale==true"
                @click="lockImageScale=false"></el-button>
              <el-button icon="el-icon-unlock" type="primary" v-else @click="lockImageScale=true"></el-button>
            </el-col>
            <el-col :md="3">目前图片的高&nbsp;&nbsp;
              <el-input-number v-model="imgScaledHeight" class="inputStyle" :precision="0" @change="changeImgScaledHeight()"
                :controls="false" :min="1" ></el-input-number>
            </el-col>
            <el-col :md="1">
              <el-button @click="toClip()">应用</el-button>
            </el-col>
          </el-row>
          <el-row>
            请选择裁剪框的形状&nbsp;&nbsp;
            <el-select v-model="value" placeholder="请选择裁剪框的形状" style="width: 100px;">
              <el-option v-for="item in shapes"
                :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
            <el-row v-if="value == 'rect'">
              <el-button-group>
                <el-button @click="clipImage('1:1')">1:1</el-button>
                <el-button @click="clipImage('3:2')">3:2</el-button>
                <el-button @click="clipImage('4:3')">4:3</el-button>
                <el-button @click="clipImage('16:9')">16:9</el-button>
              </el-button-group>&nbsp;&nbsp;
              框的宽度&nbsp;
              <el-input-number class="inputStyle" v-model="maskWidth"
                :precision="0" :controls="false" :min="1" ></el-input-number>&nbsp;
              <el-button icon="el-icon-lock" type="primary" v-if="lockMaskScale==true" @click="lockMaskScale=false"></el-button>
              <el-button icon="el-icon-unlock" type="primary" v-else @click="lockMaskScale=true"></el-button>
              框的高度&nbsp;
              <el-input-number class="inputStyle" v-model="maskHeight" :precision="0"
                :controls="false" :min="1" ></el-input-number>
            </el-row>
            <el-row v-else-if="value == 'circle'">
              框的半径&nbsp;
              <el-input-number :precision="0" v-model="maskRadius"  :controls="false"
                :min="1" :max="canvasHeight/2"></el-input-number>&nbsp;&nbsp;
            </el-row>
          </el-row>
          <el-row>
            <el-button-group>
              <el-button @click="changeAngle('left')">左旋转90</el-button>
              <el-button @click="changeAngle('right')">右旋转90</el-button>
              <el-button @click="changeAngle('x')">水平翻转</el-button>
              <el-button @click="changeAngle('y')">垂直翻转</el-button>
            </el-button-group>
          </el-row>
        </el-row>
        <el-row v-else-if="state == 'resetSize'"
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
        <el-row v-else-if="state == 'filters'">
          <el-row type="flex" justify="center">
            <el-col :md="1" class="filterName">亮度</el-col>
            <el-col :md="2">
              <el-slider class="filterSlider" v-model="brightnessValue"
                :min="-1" :max="1" :step="0.000001" @input="changeBrightness()" @change="saveJson()"></el-slider>
            </el-col>
            <el-col :md="1" class="filterName">对比度</el-col>
            <el-col :md="2">
              <el-slider class="filterSlider" v-model="contrastValue"
                :min="-1" :max="1" :step="0.000001" @input="changeContrast()" @change="saveJson()"></el-slider>
            </el-col>
            <el-col :md="1" class="filterName">饱和度</el-col>
            <el-col :md="2">
              <el-slider class="filterSlider" v-model="saturationValue"
                :min="-1" :max="1" :step="0.000001" @input="changeSaturation()" @change="saveJson()"></el-slider>
            </el-col>
            <el-col :md="1" class="filterName">模糊度</el-col>
            <el-col :md="2">
              <el-slider class="filterSlider" v-model="blurValue"
                :min="0" :max="1" :step="0.0001" @input="changeBlur()" @change="saveJson()"></el-slider>
            </el-col>
          </el-row>
          <el-row type="flex" justify="center">
            <!-- <el-col :md="1" class="filterName" style="margin-left:0px;">伽马</el-col> -->
            <el-col :md="1" class="filterName">red</el-col>
            <el-col :md="2">
              <el-slider class="filterSlider" v-model="gammaRedValue"
                :min="0.01" :max="2.2" :step="0.001" @input="changeGamma('red')" @change="saveJson()"></el-slider>
            </el-col>
            <el-col :md="1" class="filterName">green</el-col>
            <el-col :md="2">
              <el-slider class="filterSlider" v-model="gammaGreenValue"
                :min="0.01" :max="2.2" :step="0.001" @input="changeGamma('green')" @change="saveJson()"></el-slider>
            </el-col>
            <el-col :md="1" class="filterName">blue</el-col>
            <el-col :md="2">
              <el-slider class="filterSlider" v-model="gammaBlueValue"
                :min="0.01" :max="2.2" :step="0.001" @input="changeGamma('blue')" @change="saveJson()"></el-slider>
            </el-col>
            <el-col :md="1" class="filterName">锐化</el-col>
            <el-col :md="2">
              <el-slider class="filterSlider" v-model="sharpenValue"  @change="saveJson()"
                :min="1" :max="100" :step="1" @input="changeSharpen()"></el-slider>
            </el-col>
          </el-row>
          <el-row type="flex" justify="center">
            <el-col :md="1">
              <el-button @click="cancelFilters()">取消</el-button>
            </el-col>
            <el-col :md="1" class="filterName">模式</el-col>
            <el-col :md="2">
              <el-select v-model="blendModeValue" @change="changeBlend('mode')">
                <el-option v-for="item in blendModeList"
                  :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-col>
            <el-col :md="1" class="filterName">颜色</el-col>
            <el-col :md="1">
              <el-color-picker v-model="blendColorValue" @change="changeBlend('color')"
                style="margin-right: 50px;"></el-color-picker>
            </el-col>
            <el-col :md="2">
              <el-slider class="filterSlider" v-model="blendAlphaValue" @change="saveJson()"
                :min="0" :max="1" :step="0.01" @input="changeBlend('alpha')"></el-slider>
            </el-col>
            <el-col :md="1" style="margin-left: 25px;">
              <el-button @click="saveFilters()">应用</el-button>
            </el-col>
          </el-row>
        </el-row>
        <el-row v-else-if="state == 'brightness'"
          type="flex"
          justify="center"
          style="margin: 0 auto;margin-top:20px;">
          <el-col :md="1">
            <el-button @click="cancelBrightness()">取消</el-button>
          </el-col>
          <el-col :md="1" class="filterName">亮度</el-col>
          <el-col :md="4">
            <el-slider
              class="filterSlider"
              v-model="brightnessValue"
              :min="-1"
              :max="1"
              :step="0.000001"
              @input="changeBrightness()"
            ></el-slider>
          </el-col>
          <el-col :md="1">
            <el-button @click="saveBrightness()">应用</el-button>
          </el-col>
        </el-row>
        <el-row v-else-if="state == 'contrast'"
          type="flex"
          justify="center"
          style="margin: 0 auto;margin-top:20px;">
          <el-col :md="1">
            <el-button @click="cancelContrast()">取消</el-button>
          </el-col>
          <el-col :md="1" class="filterName">对比度</el-col>
          <el-col :md="4">
            <el-slider
              class="filterSlider"
              v-model="contrastValue"
              :min="-1"
              :max="1"
              :step="0.000001"
              @input="changeContrast()"
            ></el-slider>
          </el-col>
          <el-col :md="1">
            <el-button @click="saveContrast()">应用</el-button>
          </el-col>
        </el-row>
        <el-row v-else-if="state == 'saturation'"
          type="flex"
          justify="center"
          style="margin: 0 auto;margin-top:20px;">
          <el-col :md="1">
            <el-button @click="cancelSaturation()">取消</el-button>
          </el-col>
          <el-col :md="1" class="filterName">饱和度</el-col>
          <el-col :md="4">
            <el-slider
              class="filterSlider"
              v-model="saturationValue"
              :min="-1"
              :max="1"
              :step="0.000001"
              @input="changeSaturation()"
            ></el-slider>
          </el-col>
          <el-col :md="1">
            <el-button @click="saveSaturation()">应用</el-button>
          </el-col>
        </el-row>
        <el-row v-else-if="state == 'blendColor'" type="flex" justify="center"
          style="margin: 0 auto;margin-top:20px;">
          <el-col :md="1">
            <el-button @click="cancelBlendColor()">取消</el-button>
          </el-col>
          <el-col :md="1" style="margin-top:8px;">模式</el-col>
          <el-col :md="2">
            <el-select v-model="blendModeValue" @change="changeBlend('mode')">
              <el-option
                v-for="item in blendModeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-col>
          <el-col :md="1" style="margin-top:8px;">颜色</el-col>
          <el-col :md="1">
            <el-color-picker v-model="blendColorValue" @change="changeBlend('color')"></el-color-picker>
          </el-col>
          <el-col :md="4">
            <el-slider
              class="filterSlider"
              v-model="blendAlphaValue"
              :min="0"
              :max="1"
              :step="0.01"
              @input="changeBlend('alpha')"
            ></el-slider>
          </el-col>
          <el-col :md="1">
            <el-button @click="saveBlendColor()">应用</el-button>
          </el-col>
        </el-row>
        <el-row v-else-if="state == 'sharpen'"
          type="flex"
          justify="center"
          style="margin: 0 auto;margin-top:20px;">
          <el-col :md="1">
            <el-button @click="cancelSharpen()">取消</el-button>
          </el-col>
          <el-col :md="1" class="filterName">锐化</el-col>
          <el-col :md="4">
            <el-slider
              class="filterSlider"
              v-model="sharpenValue"
              :min="1"
              :max="100"
              :step="1"
              @input="changeSharpen()"
            ></el-slider>
          </el-col>
          <el-col :md="1">
            <el-button @click="saveSharpen()">应用</el-button>
          </el-col>
        </el-row>
        <el-row v-else-if="state == 'gamma'"
          type="flex"
          justify="center"
          style="margin: 0 auto;margin-top:20px;">
          <el-col :md="1">
            <el-button @click="cancelGamma()">取消</el-button>
          </el-col>
          <el-col :md="1" class="filterName" style="margin-left:0px;">red</el-col>
          <el-col :md="3">
            <el-slider
              class="filterSlider"
              v-model="gammaRedValue"
              :min="0.01"
              :max="2.2"
              :step="0.001"
              @input="changeGamma('red')"
            ></el-slider>
          </el-col>
          <el-col :md="1" class="filterName">green</el-col>
          <el-col :md="3">
            <el-slider
              class="filterSlider"
              v-model="gammaGreenValue"
              :min="0.01"
              :max="2.2"
              :step="0.001"
              @input="changeGamma('green')"
            ></el-slider>
          </el-col>
          <el-col :md="1" class="filterName">blue</el-col>
          <el-col :md="3">
            <el-slider
              class="filterSlider"
              v-model="gammaBlueValue"
              :min="0.01"
              :max="2.2"
              :step="0.001"
              @input="changeGamma('blue')"
            ></el-slider>
          </el-col>
          <el-col :md="1">
            <el-button @click="saveGamma()" style="margin-left: 25px;">应用</el-button>
          </el-col>
        </el-row>
        <el-row v-else-if="state == 'blur'"
          type="flex"
          justify="center"
          style="margin: 0 auto;margin-top:20px;">
          <el-col :md="1">
            <el-button @click="cancelBlur()">取消</el-button>
          </el-col>
          <el-col :md="1" class="filterName">模糊度</el-col>
          <el-col :md="4">
            <el-slider
              class="filterSlider"
              v-model="blurValue"
              :min="0"
              :max="1"
              :step="0.0001"
              @input="changeBlur()"
            ></el-slider>
          </el-col>
          <el-col :md="1">
            <el-button @click="saveBlur()">应用</el-button>
          </el-col>
        </el-row>
        <el-row type="flex" justify="center" style="margin-top: 20px;">
          <el-col :md="24" class="canvasDiv" id="canvasDiv">
            <canvas id="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
            <!-- <canvas id="canvas_copy" :width="canvasWidth" :height="canvasHeight"></canvas> -->
            <br />
            <img :src="imgSrc" id="img" style="display:none;" @load="init" />
            <img :src="imgSrc_clip" id="img_clip" style="" @load="init_clip" />
          </el-col>
        </el-row>
      </el-col>
      <el-drawer title="请选择要添加的图片" :visible.sync="drawer">
        <el-upload
          class="upload-demo"
          action="https://jsonplaceholder.typicode.com/posts/"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :file-list="imageList"
          list-type="picture"
        >
          <el-button size="small" type="primary">上传图片</el-button>
          <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
        </el-upload>
      </el-drawer>
    </el-row>
  </div>
</template>
<script>
export default {
  name: "App",
  data() {
    return {
      canvasWidth: 1500,
      canvasHeight: 800,
      imgSrc: "../static/douyi.jpg",
      imgSrc_clip: "",
      btnSrc: "../static/del.png",
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
      imageList: [
        { name: "圣诞帽.jpg", url: "../static/圣诞帽.png" },
        { name: "圣诞花环.png", url: "../static/圣诞花环.png" }
      ],
      drawer: false, // 右侧抽屉可见性
      jsonList: [], // 用json记录图片修改后的数据
      curIndex: -1, // 记录当前图片存在数组中的索引
      oldIndex: 0, // 记录图片更改前存在数组中的索引
      returnPrevious: true, // 上一步按钮禁用状态
      returnNext: true, // 下一步按钮禁用状态
      value: "rect", // 裁剪框的形状值,默认为矩形
      imgAngle: 0,
      curImgAngle: 0,
      rotateMode: "", // 记录旋转模式
      rotating: false, // 记录是否旋转中
      moving: false, // 记录是否移动中
      scaling: false, // 记录是否缩放了
      watermarkGroup: [],
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
      state: "", // 记录正在进行的编辑模式
      mousewheeling: false, // 是否鼠标滚轮中标志
      MAX_SIZE: 2, // 放大倍数
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
      gammaBlueValue: 1
    };
  },
  watch: {
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
        this.maskWidth = this.maskHeight * this.maskScale;
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
    value: function() {
      this.image.clipPath = new fabric.Rect({
        top: 0,
        left: 0,
        // width: this.image.width,
        // height: this.image.height,
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
    }
  },
  computed: {},
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
            scaledWidth: this.scaledWidth,
            scaledHeight: this.scaledHeight,
          });
        };
      })(this.image.toObject);
      this.canvas.add(this.image);
      this.image.scaledWidth = this.image.getScaledWidth();
      this.image.scaledHeight = this.image.getScaledHeight();
      this.image.center();
      this.image.setCoords();
      this.mask.setCoords();
      this.canvas.preserveObjectStacking = true; // 禁止选中图层时自定义顶部
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
      this.applyFilter(5, new fabric.Image.filters.Brightness({
          brightness: parseFloat(this.brightness)
        })
      );
      this.applyFilter(6, new fabric.Image.filters.Contrast({
          contrast: parseFloat(this.contrast)
        })
      );
      this.applyFilter(7, new fabric.Image.filters.Saturation({
          saturation: parseFloat(this.saturation)
        })
      );
      this.applyFilter(12, new fabric.Image.filters.Convolute({
          matrix: [0, 0, 0, 0, 1, 0, 0, 0, 0]
        })
      );
      this.applyFilter(11, new fabric.Image.filters.Blur({
          value: parseFloat(this.blur)
        })
      );
      this.applyFilter(17, new fabric.Image.filters.Gamma({
          gamma: [this.gammaRed, this.gammaGreen, this.gammaBlue]
        })
      );
      this.applyFilter(16, new fabric.Image.filters.BlendColor({
          color: this.blendColor,
          mode: this.blendMode,
          alpha: this.blendAlpha
        })
      );
      this.saveJson();
      this.scaleImage();
    },
    init_clip() {
      if (this.imgSrc_clip != "") {
        this.image.setSrc(this.imgSrc_clip);
        this.image.set({
          left: this.newImgLeft,
          top: this.newImgTop,
          scaleX: this.newImgScaleX,
          scaleY: this.newImgScaleY,
          angle: this.imgAngle,
          width: this.newImgWidth,
          height: this.newImgHeight
          // lockMovementX: true,
          // lockMovementY: true,
          // lockRotation: true,
          // hasControls: false, // 编辑框
          // selectable: false
        });
        this.image.clipPath = new fabric.Rect({
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
        });
        this.imgWidth = this.image.width;
        this.imgHeight = this.image.height;
        this.imgScale = this.image.width / this.image.height;
        this.image.setCoords();
        this.image.clipPath.setCoords();
        this.image.center();
        this.image.clipPath.center();
        this.image.setCoords();
        this.image.clipPath.setCoords();
        this.imgScaledWidth = this.image.getScaledWidth();
        this.imgScaledHeight = this.image.getScaledHeight();
        console.log("重载图片");
        this.canvas.renderAll();
        this.scaleImage();
        this.saveJson();
        this.curIndex = this.oldIndex;
        this.jsonList.splice(this.curIndex + 1);
        this.oldIndex = -1;
        this.returnPrevious = false;
        this.returnNext = true;
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

    // 裁剪相关方法
    addMask() {
      this.state = "clip";
      this.jsonList[this.curIndex] = this.canvas.toJSON();
      this.imgScaledWidth = this.image.getScaledWidth();
      this.imgScaledHeight = this.image.getScaledHeight();
      if (this.mask) {
        this.canvas.remove(this.mask);
      }
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
          angle: this.image.angle,
          lockRotation: true,
          hasControls: false,
          lockMovementX: true,
          lockMovementY: true,
          selectable: false,
        });
        // this.mask.width = this.newImgWidth;
        // this.mask.height = this.newImgHeight;
        this.mask.width = this.image.getScaledWidth();
        this.mask.height = this.image.getScaledHeight();
        this.maskWidth = this.mask.getScaledWidth();
        this.maskHeight = this.mask.getScaledHeight();
        this.mask.setCoords();
        this.mask.toObject = (function(toObject) {
          return function() {
            return fabric.util.object.extend(toObject.call(this), {
              name: this.name
            });
          };
        })(this.mask.toObject);
        this.canvas.add(this.mask);
        this.canvas.setActiveObject(this.image);
        this.maskScale = this.imgScale;
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
          left: this.image.left,
          top: this.image.top,
          stroke: "#F5A623",
          strokeWidth: 5,
          lockRotation: true,
          hasControls: false,
          lockMovementX: true,
          lockMovementY: true,
          selectable: false,
        });
        debugger
        this.mask.toObject = (function(toObject) {
          return function() {
            return fabric.util.object.extend(toObject.call(this), {
              name: this.name
            });
          };
        })(this.mask.toObject);
        this.maskRadius = this.mask.radius;
        this.maskScale = 1;
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
        this.canvas.renderAll();
      }
      this.mask.name = "mask";
      this.canvas.renderAll();
      this.maskWidth = this.mask.getScaledWidth();
      this.maskHeight = this.mask.getScaledHeight();
      this.newImgScaleX = 1;
      this.newImgScaleY = 1;
      this.state = "clip";
      this.scaleMask("on");
      this.mousewheelImage("on");
      this.saveJson();
      this.oldIndex = this.curIndex;
    },
    removeMask() {
      this.state = "";
      this.canvas.remove(this.mask);
      this.restoreAngle();
      this.mousewheelImage("off");
      this.scaleMask("off");
      var self = this;
      this.curIndex = this.oldIndex - 1;
      this.returnBack("previous");
      this.curIndex = this.oldIndex - 1;
      this.jsonList.splice(this.curIndex + 1);
    },
    // 选择裁剪框尺寸
    clipImage(command) {
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
      } else if (command == "3:2") {
        this.maskScale = 3/2;
        if (this.imgScale > this.maskScale) {
          if (this.imgScale > 1) {
            this.mask.set("height", min / this.mask.scaleY);
            this.mask.set("width", (this.maskScale * min) / this.mask.scaleX);
          } else {
            this.mask.set("width", min / this.mask.scaleX);
            this.mask.set("height", (min / this.maskScale) / this.mask.scaleY);
          }
        } else {
          if (this.imgScale >= 1) {
            this.mask.set("width", max / this.mask.scaleX);
            this.mask.set("height", this.mask.width / this.maskScale);
          } else {
            this.mask.set("height", max / this.mask.scaleY);
            this.mask.set("width", this.maskScale * this.mask.height);
          }
        }
      } else if (command == "4:3") {
        this.maskScale = 4 / 3;
        if (this.imgScale > this.maskScale) {
          if (this.imgScale > 1) {
            this.mask.set("height", min / this.mask.scaleY);
            this.mask.set("width", (this.maskScale * min) / this.mask.scaleX);
          } else {
            this.mask.set("width", min / this.mask.scaleX);
            this.mask.set("height", (min / this.maskScale) / this.mask.scaleY);
          }
        } else {
          if (this.imgScale >= 1) {
            this.mask.set("width", max / this.mask.scaleX);
            this.mask.set("height", this.mask.width / this.maskScale);
          } else {
            this.mask.set("height", max / this.mask.scaleY);
            this.mask.set("width", this.maskScale * this.mask.height);
          }
        }
      } else if (command == "16:9") {
        this.maskScale = 16 / 9;
        if (this.imgScale > this.maskScale) {
          if (this.imgScale > 1) {
            this.mask.set("height", min / this.mask.scaleY);
            this.mask.set("width", (this.maskScale * min) / this.mask.scaleX);
          } else {
            this.mask.set("width", min / this.mask.scaleX);
            this.mask.set("height", (min / this.maskScale) / this.mask.scaleY);
          }
        } else {
          if (this.imgScale >= 1) {
            this.mask.set("width", max / this.mask.scaleX);
            this.mask.set("height", this.mask.width / this.maskScale);
          } else {
            this.mask.set("height", max / this.mask.scaleY);
            this.mask.set("width", this.maskScale * this.mask.height);
          }
          this.mask.set("top", this.image.top);
          this.mask.set("left", this.image.left);
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
      this.mask.setCoords();
      this.image.setCoords();
      this.newImgLeft = this.mask.left;
      this.newImgTop = this.mask.top;
      this.newImgWidth = this.maskWidth;
      this.newImgHeight = this.maskHeight;
      var radius = this.mask.radius;
      if (this.value == "rect") {
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
      } else if (this.value == "circle") {
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
      this.canvas.renderAll();
      this.mousewheelImage("off");
      this.scaleMask("off");
    },
    // 监听裁剪框的缩放
    scaleMask(command) {
      if (command == "on") {
        this.mask.on({
          scaling: e => {
            if (this.value == "rect") {
              this.maskWidth = this.mask.getScaledWidth();
              this.maskHeight = this.mask.getScaledHeight();
            } else if (this.value == "circle") {
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
    // 监听图片的缩放
    mousewheelImage(command) {
      if (command == "on") {
        var self = this;
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
            console.log(this.image.getScaledWidth() + "," + this.image.getScaledHeight());
            console.log(this.imgScaledWidth + "," + this.imgScaledHeight);
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
    }, 
    changeImgScaledWidth(){
      debugger
      if (this.lockImageScale && !this.mousewheeling) {
        this.imgScaledHeight = this.imgScaledWidth / this.imgScale;
      }
    },
    changeImgScaledHeight(){
      debugger
      if (this.lockImageScale && !this.mousewheeling) {
        this.imgScaledWidth = this.imgScaledHeight * this.imgScale;
      }
    },
    scaleImage() {
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
    // chooseResetSize() {
    //   this.state = "resetSize";
    //   this.imgScaledWidth = this.image.getScaledWidth();
    //   this.imgScaledHeight = this.image.getScaledHeight();
    // },
    // refreshSize() {
    //   this.state = "";
    // },
    // toResetSize() {
    //   if (this.lockImageScale) {
    //     if (this.imgScaledHeight <= this.canvas.height) {
    //       if (this.imgScaledWidth > this.imgScaledHeight) {
    //         this.image.scaleToHeight(this.imgScaledHeight);
    //       } else {
    //         this.image.scaleToWidth(this.imgScaledWidth);
    //       }
    //     } else {
    //       this.imgWidth = this.imgScaledWidth;
    //       this.imgHeight = this.imgScaledHeight;
    //     }
    //   } else {
    //     if (this.imgScaledWidth > this.imgScaledHeight) {
    //       this.image.set("scaleX", this.imgScaledWidth / this.image.width);
    //       this.image.set("scaleY", this.imgScaledHeight / this.image.height);
    //     } else {
    //       this.image.set("scaleX", this.imgScaledWidth / this.image.width);
    //       this.image.set("scaleY", this.imgScaledHeight / this.image.height);
    //     }
    //   }
    //   this.newImgWidth = this.imgScaledWidth;
    //   this.newImgHeight = this.imgScaledHeight;
    //   this.newImgScaleX = 1;
    //   this.newImgScaleY = 1;
    //   var newImg = this.canvas.toDataURL({
    //     format: "png",
    //     multiplier: this.newImgWidth / this.image.getScaledWidth(),
    //     top: this.image.top,
    //     left: this.image.left,
    //     width: this.newImgWidth,
    //     height: this.newImgHeight
    //   });
    //   this.imgSrc_clip = newImg;
    //   this.image.setCoords();
    //   this.image.center();
    //   this.canvas.renderAll();
    //   this.imgScaledWidth = this.image.getScaledWidth();
    //   this.imgScaledHeight = this.image.getScaledHeight();
    //   this.newImgLeft = this.image.left;
    //   this.newImgTop = this.image.top;
    //   this.state = "";
    // },

    // // 旋转相关方法
    // addRotateMask() {
    //   this.state = "rotate";
    //   this.mask = new fabric.Rect({
    //     left: this.image.left,
    //     top: this.image.top,
    //     originX: "left",
    //     originY: "top",
    //     stroke: "#F5A623",
    //     strokeWidth: 5,
    //     cornerColor: "#F5A623",
    //     fill: "rgba(255, 255, 255, 0)",
    //     objectCaching: false,
    //     padding: 0,
    //     angle: this.image.angle,
    //     // lockMovementX: true,
    //     // lockMovementY: true,
    //     lockRotation: true,
    //     hasControls: false // 编辑框
    //     // selectable: false
    //   });
    //   this.mask.width = this.image.getScaledWidth();
    //   this.mask.height = this.image.getScaledHeight();
    //   this.mask.setCoords();
    //   this.mask.center();
    //   this.canvas.add(this.mask);
    //   this.canvas.setActiveObject(this.image);
    //   this.maskWidth = this.mask.getScaledWidth();
    //   this.maskHeight = this.mask.getScaledHeight();
    //   this.newImgScaleX = 1;
    //   this.newImgScaleY = 1;
    //   this.canvas.renderAll();
    //   this.mousewheelImage("on");
    // },
    // 选择旋转方式
    changeAngle(command) {
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
          console.log("图片适应画布的宽" + this.image.getScaledWidth());
        }
        if (this.image.getScaledWidth() >= this.canvas.height) {
          this.image.scaleToWidth(this.canvas.height);
          console.log("图片适应画布的高" + this.image.getScaledHeight());
        }
        // this.mask.set("width", this.image.getScaledHeight());
        // this.mask.set("height", this.image.getScaledWidth());
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
      this.mousewheelImage("off");
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
    // toRotate() {
    //   this.newImgLeft = this.mask.left;
    //   this.newImgTop = this.mask.top;
    //   this.newImgWidth = this.mask.width;
    //   this.newImgHeight = this.mask.height;
    //   this.image.clipPath = new fabric.Rect({
    //     left: this.newImgLeft,
    //     top: this.newImgTop,
    //     width: this.newImgWidth,
    //     height: this.newImgHeight
    //   });
    //   this.canvas.remove(this.mask);
    //   var src = this.canvas.toDataURL({
    //     format: "png",
    //     left: this.newImgLeft,
    //     top: this.newImgTop,
    //     width: this.newImgWidth,
    //     height: this.newImgHeight
    //   });
    //   this.imgAngle = 0;
    //   this.imgSrc_clip = src;
    //   this.canvas.renderAll();
    //   this.state = "";
    //   this.mousewheelImage("off");
    // },

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
        this.image.filters[index][prop] = value;
        this.image.applyFilters();
        this.canvas.renderAll();
      }
    },
    chooseFilters(){
      this.oldIndex = this.curIndex;
      this.state='filters';
      // this.applyFilter(5, new fabric.Image.filters.Brightness({
      //     brightness: parseFloat(this.brightness)
      //   })
      // );
      // this.applyFilter(6, new fabric.Image.filters.Contrast({
      //     contrast: parseFloat(this.contrast)
      //   })
      // );
      // this.applyFilter(7, new fabric.Image.filters.Saturation({
      //     saturation: parseFloat(this.saturation)
      //   })
      // );
      // this.applyFilter(12, new fabric.Image.filters.Convolute({
      //     matrix: [0, 0, 0, 0, 1, 0, 0, 0, 0]
      //   })
      // );
      // this.applyFilter(11, new fabric.Image.filters.Blur({
      //     value: parseFloat(this.blur)
      //   })
      // );
      // this.applyFilter(17, new fabric.Image.filters.Gamma({
      //     gamma: [this.gammaRed, this.gammaGreen, this.gammaBlue]
      //   })
      // );
      // this.applyFilter(16, new fabric.Image.filters.BlendColor({
      //     color: this.blendColor,
      //     mode: this.blendMode,
      //     alpha: this.blendAlpha
      //   })
      // );
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
    },
    cancelFilters(){
      this.state = "";
      // this.applyFilterValue(5, "brightness", parseFloat(this.brightness));
      // this.applyFilterValue(6, "contrast", parseFloat(this.contrast));
      // this.applyFilterValue(7, "saturation", parseFloat(this.saturation));
      // var a = -(this.sharpen - 1) / 4;
      // this.applyFilterValue(12, "matrix", [
      //   0,
      //   a,
      //   0,
      //   a,
      //   this.sharpen,
      //   a,
      //   0,
      //   a,
      //   0
      // ]);
      // this.applyFilterValue(11, "blur", parseFloat(this.blur));
      // this.applyFilterValue(17, "gamma", [
      //   parseFloat(this.gammaRed),
      //   parseFloat(this.gammaGreen),
      //   parseFloat(this.gammaBlue)
      // ]);
      // this.applyFilterValue(16, "color", this.blendColor);
      // this.applyFilterValue(16, "mode", this.blendMode);
      // this.applyFilterValue(16, "alpha", this.blendAlpha);
      this.curIndex = this.oldIndex + 1;
      this.returnBack("previous");
      this.curIndex = this.oldIndex;
      this.jsonList.splice(this.curIndex + 1);
    },
    saveFilters(){
      this.state = "";
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
      this.saveJson();
      this.jsonList.splice(this.curIndex + 1);
    },
    // 亮度
    chooseBrightness() {
      this.state = "brightness";
      this.applyFilter(
        5,
        new fabric.Image.filters.Brightness({
          brightness: parseFloat(this.brightness)
        })
      );
      this.brightnessValue = this.brightness;
    },
    changeBrightness() {
      this.applyFilterValue(5, "brightness", parseFloat(this.brightnessValue));
    },
    cancelBrightness() {
      this.state = "";
      this.applyFilterValue(5, "brightness", parseFloat(this.brightness));
    },
    saveBrightness() {
      this.state = "";
      this.brightness = this.brightnessValue;
      this.saveJson();
    },
    // 对比度
    chooseContrast() {
      this.state = "contrast";
      this.applyFilter(
        6,
        new fabric.Image.filters.Contrast({
          contrast: parseFloat(this.contrast)
        })
      );
      this.contrastValue = this.contrast;
    },
    changeContrast() {
      this.applyFilterValue(6, "contrast", parseFloat(this.contrastValue));
    },
    cancelContrast() {
      this.state = "";
      this.applyFilterValue(6, "contrast", parseFloat(this.contrast));
    },
    saveContrast() {
      this.state = "";
      this.contrast = this.contrastValue;
      this.saveJson();
    },
    // 饱和度
    chooseSaturation() {
      this.state = "saturation";
      this.applyFilter(
        7,
        new fabric.Image.filters.Saturation({
          saturation: parseFloat(this.saturation)
        })
      );
      this.saturationValue = this.saturation;
    },
    changeSaturation() {
      this.applyFilterValue(7, "saturation", parseFloat(this.saturationValue));
    },
    cancelSaturation() {
      this.state = "";
      this.applyFilterValue(7, "saturation", parseFloat(this.saturation));
    },
    saveSaturation() {
      this.state = "";
      this.saturation = this.saturationValue;
      this.saveJson();
    },
    // 混合颜色
    chooseBlendColor() {
      this.state = "blendColor";
      this.applyFilter(
        16,
        new fabric.Image.filters.BlendColor({
          color: this.blendColor,
          mode: this.blendMode,
          alpha: this.blendAlpha
        })
      );
      this.blendColorValue = this.blendColor;
      this.blendModeValue = this.blendMode;
      this.blendAlphaValue = this.blendAlpha;
    },
    changeBlend(prop) {
      if (prop == "color")
        this.applyFilterValue(16, "color", this.blendColorValue);
      else if (prop == "mode")
        this.applyFilterValue(16, "mode", this.blendModeValue);
      else if (prop == "alpha")
        this.applyFilterValue(16, "alpha", parseFloat(this.blendAlphaValue));
      // this.saveJson();
    },
    cancelBlendColor() {
      this.state = "";
      this.applyFilterValue(16, "color", this.blendColor);
      this.applyFilterValue(16, "mode", this.blendMode);
      this.applyFilterValue(16, "alpha", this.blendAlpha);
    },
    saveBlendColor() {
      this.state = "";
      this.blendColor = this.blendColorValue;
      this.blendMode = this.blendModeValue;
      this.blendAlpha = this.blendAlphaValue;
      this.saveJson();
    },
    // 锐化
    chooseSharpen() {
      this.state = "sharpen";
      this.applyFilter(
        12,
        new fabric.Image.filters.Convolute({
          // matrix: [ 0, -1,  0, -1,  5, -1, 0, -1,  0 ]
          matrix: [0, 0, 0, 0, 1, 0, 0, 0, 0]
        })
      );
      this.sharpenValue = this.sharpen;
    },
    changeSharpen() {
      var a = -(this.sharpenValue - 1) / 4;
      this.applyFilterValue(12, "matrix", [
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
    cancelSharpen() {
      this.state = "";
      var a = -(this.sharpen - 1) / 4;
      this.applyFilterValue(12, "matrix", [
        0,
        a,
        0,
        a,
        this.sharpen,
        a,
        0,
        a,
        0
      ]);
    },
    saveSharpen() {
      this.state = "";
      this.sharpen = this.sharpenValue;
      this.saveJson();
    },
    // 伽马
    chooseGamma() {
      this.state = "gamma";
      this.applyFilter(
        17,
        new fabric.Image.filters.Gamma({
          gamma: [this.gammaRed, this.gammaGreen, this.gammaBlue]
        })
      );
      this.gammaRedValue = this.gammaRed;
      this.gammaGreenValue = this.gammaGreen;
      this.gammaBlueValue = this.gammaBlue;
    },
    changeGamma(color) {
      // var current = this.getFilter(17).gamma;
      // if (color == "red") {
      //   current[0] = parseFloat(this.gammaRedValue);
      // } else if (color == "green") {
      //   current[1] = parseFloat(this.gammaGreenValue);
      // } else if (color == "blue") {
      //   current[2] = parseFloat(this.gammaBlueValue);
      // }
      // this.applyFilterValue(17, "gamma", current);
      this.applyFilterValue(17, "gamma", [this.gammaRedValue, this.gammaGreenValue, this.gammaBlueValue]);
    },
    cancelGamma() {
      this.state = "";
      this.applyFilterValue(17, "gamma", [
        parseFloat(this.gammaRed),
        parseFloat(this.gammaGreen),
        parseFloat(this.gammaBlue)
      ]);
    },
    saveGamma() {
      this.state = "";
      this.gammaRed = this.gammaRedValue;
      this.gammaGreen = this.gammaGreenValue;
      this.gammaBlue = this.gammaBlueValue;
      this.saveJson();
    },
    // 模糊
    chooseBlur() {
      this.state = "blur";
      this.applyFilter(
        11,
        new fabric.Image.filters.Blur({
          value: parseFloat(this.blur)
        })
      );
      this.blurValue = this.blur;
    },
    changeBlur() {
      this.applyFilterValue(11, "blur", parseFloat(this.blurValue));
    },
    cancelBlur() {
      this.state = "";
      this.applyFilterValue(11, "blur", parseFloat(this.blur));
    },
    saveBlur() {
      this.state = "";
      this.blur = this.blurValue;
      this.saveJson();
    },

    // 保存图片
    save() {
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
      btn = new fabric.Image(delBtn, {
        left: watermark.left + watermark.width - 30,
        top: watermark.top + 10,
        width: 20,
        height: 20,
        visible: true,
        hasControls: false,
        lockMovementX: true,
        lockMovementY: true,
        lockScalingFlip: true
      });
      btn.toObject = (function(toObject) {
        return function() {
          return fabric.util.object.extend(toObject.call(this), {
            name: this.name
          });
        };
      })(btn.toObject);
      btn.setCoords();
      this.canvas.add(watermark, btn);
      watermark.name = "watermark";
      btn.name = "btn";
      this.canvas.renderAll();
      this.watermarkGroup.push({ watermark: watermark, btn: btn });
      this.clickBtn(watermark, btn);
      this.watermarkListener(watermark, btn);
      this.saveJson();
    },
    // 监听水印的鼠标事件
    watermarkListener(watermark, btn) {
      watermark.on({
        scaling: e => {
          btn.set("top", watermark.top + 10);
          btn.set("left", watermark.left + watermark.getScaledWidth() - 30);
          btn.setCoords();
          this.canvas.renderAll();
        },
        mousedown: e => {
          if (
            !(
              watermark.left + watermark.getScaledWidth() - 30 < e.pointer.x &&
              e.pointer.x < watermark.left + watermark.getScaledWidth() - 10 &&
              watermark.top + 10 < e.pointer.y &&
              e.pointer.y < watermark.top + 30
            )
          ) {
            for (var i = 0; i < this.watermarkGroup.length; i++) {
              this.watermarkGroup[i].btn.set("visible", false);
            }
          } else {
            for (var i = 0; i < this.watermarkGroup.length; i++) {
              if (this.watermarkGroup[i].watermark == watermark) {
                this.watermarkGroup.splice(i, 1);
                break;
              }
            }
            this.canvas.remove(watermark, btn);
          }
          this.canvas.renderAll();
        },
        mouseup: e => {
          if (
            !(
              watermark.left + watermark.getScaledWidth() - 30 < e.pointer.x &&
              e.pointer.x < watermark.left + watermark.getScaledWidth() - 10 &&
              watermark.top + 10 < e.pointer.y &&
              e.pointer.y < watermark.top + 30
            )
          ) {
            var pointer = watermark.aCoords.tr;
            if(watermark.angle <= 30 && watermark.angle >= 0){
              btn.set("top", pointer.y + 10);
              btn.set("left", pointer.x - 30);
            }else if(watermark.angle <= 90 && watermark.angle > 30){
              btn.set("top", pointer.y - 15);
              btn.set("left", pointer.x - 30);
            }else if(watermark.angle <= 120 && watermark.angle > 90){
              btn.set("top", pointer.y - 30);
              btn.set("left", pointer.x - 30);
            }else if(watermark.angle <= 150 && watermark.angle > 120){
              btn.set("top", pointer.y - 30);
              btn.set("left", pointer.x - 15);
            }else if(watermark.angle <= 180 && watermark.angle > 150){
              btn.set("top", pointer.y - 30);
              btn.set("left", pointer.x + 10);
            }else if(watermark.angle <= 210 && watermark.angle > 180){
              btn.set("top", pointer.y - 15);
              btn.set("left", pointer.x + 10);
            }else if(watermark.angle <= 245 && watermark.angle > 210){
              btn.set("top", pointer.y - 15);
              btn.set("left", pointer.x + 10);
            }else if(watermark.angle <= 270 && watermark.angle > 245){
              btn.set("top", pointer.y + 10);
              btn.set("left", pointer.x + 10);
            }else if(watermark.angle <= 300 && watermark.angle > 270){
              btn.set("top", pointer.y + 15);
              btn.set("left", pointer.x + 10);
            }else if(watermark.angle <= 360 && watermark.angle > 300){
              btn.set("top", pointer.y + 10);
              btn.set("left", pointer.x - 15);
            }
            console.log(watermark.angle);
            btn.set("visible", true);
            btn.setCoords();
            this.canvas.renderAll();
          }
        },
        mouseout: e => {
          btn.set("visible", false);
        }
      });
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
          this.canvas.remove(watermark, btn);
          console.log("delete");
          this.saveJson();
        }
      });
    },
    // 回退
    saveJson() {    
      if (this.curIndex == 0 && this.jsonList.length > 1) {
        this.jsonList.splice(1);
      }
      this.jsonList.push(this.canvas.toJSON());
      this.curIndex = this.jsonList.length - 1;
    },
    returnBack(command) {
      this.jsonList[this.curIndex] = this.canvas.toJSON();
      console.log(this.jsonList);
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
          debugger
          if (object.name) {
            if (object.name == "watermark") {
              self.watermarkGroup.push({
                watermark: object,
                btn: new fabric.Image()
              });
            } else if (object.name == "btn") {
              var temp = self.watermarkGroup[self.watermarkGroup.length - 1];
              temp.btn = object;
              self.watermarkListener(temp.watermark, temp.btn);
              self.clickBtn(temp.watermark, temp.btn);
            } else if (object.name == "mask") {
              self.mask = object;
              self.maskWidth = self.mask.getScaledWidth();
              self.maskHeight = self.mask.getScaledHeight();
              self.maskScale = self.maskWidth / self.maskHeight;
            }
          } else {
            debugger
            self.image = object;
            self.scaleImage();
            self.imgScaledWidth = self.image.getScaledWidth();
            self.imgScaledHeight = self.image.getScaledHeight();
          }
        }
      );
      this.canvas.renderAll();
    }
  },
  mounted() {
    var canvasDiv = document.getElementById("canvasDiv");
    this.canvasWidth = canvasDiv.offsetWidth;
    this.canvasHeight = canvasDiv.offsetHeight;
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
  min-width: 950px;
}

.el-row {
  margin-top: 10px;
}

.inputStyle {
  width: 120px;
}

.filterName {
  margin-top: 8px;
  margin-left: 15px;
}


.filterSlider {
  /* width: 240px;
  margin-right: 20px; */
  width: 100%;
}

canvas {
  border: 1px dashed black;
  margin: 0 auto;
}
</style>
