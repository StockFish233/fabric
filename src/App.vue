<template>
  <div id="app">
      <el-menu id="menu"
        :default-active="activeIndex2"
        class="el-menu-demo"
        mode="horizontal"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b">
        <el-menu-item index="1">首页</el-menu-item>
        <el-menu-item index="2">无关紧要的导航</el-menu-item>
      </el-menu>
    <div><el-button v-if="editVisible == false" @click="editVisible = true">打开编辑器</el-button></div>
    <!-- <el-row type="flex" justify="center">
    <el-col id="box" style="background-color:beige;margin:0 auto;" > -->
    <div v-if="editVisible == true" id="box" style="margin:0 auto;" >
      <v-photo-editor :imgSrc="imgSrc" :clientWidth="clientWidth" :clientHeight="clientHeight"
      :style="{width: clientWidth+'px', height: clientHeight+'px'}" ></v-photo-editor>
    </div>
    <!-- </el-col>
    </el-row> -->
  </div>
</template>
<script>
import PhotoEditor from './components/PhotoEditor.vue'
export default {
  name: "App",
  components: {
    'v-photo-editor': PhotoEditor
  },
  data(){
    return {
      activeIndex2: '1',
      editVisible: true,
      imgSrc: "../static/douyi.jpg",
      clientWidth: 1920,
      clientHeight: 900,
    }
  },
  methods: {
    getSize(){
      console.log("window resize");
      var self = this;
      this.$nextTick(() => {
        var menu = document.getElementById("menu");
        self.clientWidth = window.innerWidth;
        self.clientHeight = window.innerHeight - menu.clientHeight; 
        console.log(self.clientWidth + "," + self.clientHeight);
      })
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
    var menu = document.getElementById("menu");
    this.clientWidth = window.innerWidth;
    this.clientHeight = window.innerHeight - menu.clientHeight;
    console.log(this.clientWidth + "," + this.clientHeight);
    window.addEventListener('resize', this.debounce(this.getSize, 500));
  }
};
</script>

<style>
body {     
  margin:0px ;
  padding:0px;
  overflow: hidden;
}

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0;
  height: 100%;
  width: 100%;
}

</style>
