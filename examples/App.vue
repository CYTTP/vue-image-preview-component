<template>
  <div id="app">
    <div class="bg">
      <button class="btn" @click="open">预览</button>
    </div>

    <VueImagePreview
      v-if="isShow"
      :bgColor="'rgba(25,255,222,.2)'"
      :urlList="imgList"
      :onClose="close"
      drag
      download
    ></VueImagePreview>
  </div>
</template>

<script>
import VueImagePreview from ".././packages/img-preview/index.vue";
// import VueImgPreview from "vue-img-preview-component";

/**
 * test
 */
export default {
  name: "App",
  components: {
    VueImagePreview,
  },
  data() {
    return {
      imgList: [
        require("./assets/logo.png"),
        "https://images.pexels.com/photos/18926717/pexels-photo-18926717.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      ],
      isShow: false,
    };
  },
  methods: {
    open(e) {
      e.preventDefault();
      this.isShow = true;
    },
    close() {
      this.isShow = false;
    },
  },
};
</script>

<style>
/*  */
#app {
  height: 100vh;
}
.bg {
  width: 100%;
  height: 100%;
  background-image: url("https://images.pexels.com/photos/18926717/pexels-photo-18926717.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1");
  background-repeat: no-repeat;
  background-position: center center;
}
.btn {
  width: 80px;
  height: 50px;
}
</style>
