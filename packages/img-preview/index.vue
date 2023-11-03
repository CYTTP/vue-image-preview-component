<template>
  <transition name="viewer-fade">
    <div
      class="image-viewer__wrapper"
      :style="{ 'z-index': zIndex, background: bgColor }"
    >
      <div class="image-viewer__mask" :style="{ background: bgColor }"></div>
      <span class="image-viewer__btn image-viewer__close" @click="hide">
        <!-- <i class="el-icon-close" style="color: #fff"></i> -->
        <i class="el-icon-close" style="color: #fff"></i>
      </span>
      <template v-if="!isSingle">
        <span
          class="image-viewer__btn image-viewer__prev"
          :class="{ 'is-disabled': !infinite && isFirst }"
          @click="prev"
        >
          <i class="el-icon-arrow-left" />
        </span>
        <span
          class="image-viewer__btn image-viewer__next"
          :class="{ 'is-disabled': !infinite && isLast }"
          @click="next"
        >
          <i class="el-icon-arrow-right" />
        </span>
      </template>
      <div class="image-viewer__btn image-viewer__actions">
        <div class="image-viewer__actions__inner" style="cursor: pointer">
          <i
            class="el-icon-zoom-out"
            style="cursor: pointer"
            @click="handleActions('zoomOut')"
          ></i>
          <i class="el-icon-zoom-in" @click="handleActions('zoomIn')"></i>
          <i class="el-image-viewer__actions__divider"></i>
          <i :class="mode.icon" @click="toggleMode"></i>
          <i class="el-image-viewer__actions__divider"></i>
          <i
            class="el-icon-refresh-left"
            @click="handleActions('anticlocelise')"
          ></i>
          <i
            class="el-icon-refresh-right"
            @click="handleActions('clocelise')"
          ></i>
          <i
            class="el-icon-bottom"
            v-show="download"
            @click="handleActions('down')"
          ></i>
        </div>
      </div>
      <div
        class="image-viewer__canvas"
        v-if="mousewheelEventName"
        style="cursor: pointer"
      >
        <img
          v-for="(url, i) in urlList"
          v-if="i === index"
          ref="img"
          class="el-image-viewer__img"
          :key="url"
          :src="currentImg"
          :style="imgStyle"
          @load="handleImgLoad"
          @error="handleImgError"
          @mousedown="handleMouseDown"
          @DOMMouseScroll="handleMouseWheel"
          @mousemove="handleMouseMove"
          @mouseleave="handleMouseLeave"
          @mouseup="handleMouseUp"
        />
      </div>
      <div class="image-viewer__canvas" v-else style="cursor: pointer">
        <img
          v-for="(url, i) in urlList"
          v-if="i === index"
          ref="img"
          class="el-image-viewer__img"
          :key="url"
          :src="currentImg"
          :style="imgStyle"
          @load="handleImgLoad"
          @error="handleImgError"
          @mousedown="handleMouseDown"
          @mousewheel.stop="handleMouseWheel"
          @mousemove="handleMouseMove"
          @mouseleave="handleMouseLeave"
          @mouseup="handleMouseUp"
        />
      </div>
    </div>
  </transition>
</template>

<script>
import { on, off } from "./d";
import { getBlob, saveAs } from "./f";
import { rafThrottle, isFirefox } from "./util";

const Mode = {
  CONTAIN: {
    name: "contain",
    icon: "el-icon-full-screen",
  },
  ORIGINAL: {
    name: "original",
    icon: "el-icon-c-scale-to-original",
  },
};
export default {
  name: "VueImagePreview",
  props: {
    urlList: {
      type: Array,
      default: () => [],
    },
    zIndex: {
      type: Number,
      default: 2000,
    },
    bgColor: {
      type: String,
      default: "#fff",
    },
    drag: {
      type: Boolean,
      default: false,
    },
    download: {
      type: Boolean,
      default: false,
    },
    onSwitch: {
      type: Function,
      default: () => {},
    },
    onClose: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      index: 0,
      isShow: false,
      infinite: true,
      loading: false,
      mode: Mode.CONTAIN,
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      imageLeft: 0,
      imageTop: 0,
      mousewheelEventName: isFirefox() ? true : false,
      transform: {
        scale: 1,
        deg: 0,
        enableTransition: true,
      },
    };
  },
  watch: {
    index: {
      handler: function (val) {
        this.reset();
        this.onSwitch(val);
      },
    },
    currentImg(val) {
      this.$nextTick((_) => {
        const $img = this.$refs.img[0];
        if (!$img.complete) {
          this.loading = true;
        }
      });
    },
  },
  methods: {
    downloadFile(url, filename) {
      let that = this;
      url = url + `?${Math.random()}`;
      getBlob(url, function (blob) {
        saveAs(blob, filename);
      });
    },
    hide() {
      this.deviceSupportUninstall();
      this.onClose();
    },
    prev() {
      if (this.isFirst && !this.infinite) return;
      const len = this.urlList.length;
      this.index = (this.index - 1 + len) % len;
    },
    next() {
      if (this.isLast && !this.infinite) return;
      const len = this.urlList.length;
      this.index = (this.index + 1) % len;
    },
    reset() {
      (this.dragStartX = 0),
        (this.dragStartY = 0),
        (this.imageLeft = 0),
        (this.imageTop = 0),
        (this.transform = {
          scale: 1,
          deg: 0,
          enableTransition: true,
        });
    },
    toggleMode() {
      if (this.loading) return;
      const modeNames = Object.keys(Mode);
      const modeValues = Object.values(Mode);
      const index = modeValues.indexOf(this.mode);
      const nextIndex = (index + 1) % modeNames.length;
      this.mode = Mode[modeNames[nextIndex]];
      this.reset();
    },
    handleActions(action, options = {}) {
      if (this.loading) return;
      const { zoomRate, rotateDeg, enableTransition } = Object.assign(
        {
          zoomRate: 0.2,
          rotateDeg: 90,
          enableTransition: true,
        },
        { options }
      );
      const { transform } = this;
      switch (action) {
        case "zoomOut":
          if (transform.scale > 0.2) {
            transform.scale = parseFloat(
              (transform.scale - zoomRate).toFixed(3)
            );
          }
          break;
        case "zoomIn":
          transform.scale = parseFloat((transform.scale + zoomRate).toFixed(3));
          break;
        case "clocelise":
          transform.deg += rotateDeg;
          break;
        case "anticlocelise":
          transform.deg -= rotateDeg;
          break;
        case "down":
          const fileName = this.currentImg
            .split(".")
            .slice(-2)[0]
            .split("/")
            .slice(-1)[0]
            .split("_")[0];
          this.downloadFile(this.currentImg, fileName);
          transform.enableTransition = enableTransition;
      }
    },
    handleImgLoad(e) {
      this.loading = false;
    },
    handleImgError(e) {
      this.loading = false;
      e.target.alt = "加载失败";
    },
    handleMouseDown(e) {
      this.isDragging = this.drag;
      if (this.loading || e.button !== 0) return;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      this.startImageX = this.imageLeft;
      this.startImageY = this.imageTop;
    },
    handleMouseUp(e) {
      this.isDragging = false;
      e.preventDefault();
    },
    handleMouseLeave(e) {
      this.isDragging = false;
      e.preventDefault();
    },
    handleMouseMove(e) {
      e.preventDefault();
      if (this.isDragging) {
        const offsetX = e.clientX - this.dragStartX;
        const offsetY = e.clientY - this.dragStartY;
        this.imageLeft = this.startImageX + offsetX;
        this.imageTop = this.startImageY + offsetY;
      }
    },
    handleMouseWheel(e) {
      const wheelDelta = this.mousewheelEventName ? e.detail : e.deltaY;
      if (wheelDelta > 0) {
        this.handleActions("zoomOut");
      } else if (wheelDelta < 0) {
        this.handleActions("zoomIn");
      }
      e.preventDefault();
    },
    deviceSupportInstall() {
      this._keyDownHandler = rafThrottle((e) => {
        const keyCode = e.keyCode;
        switch (keyCode) {
          // ESC
          case 27:
            this.hide();
            break;
          // SP ACE
          case 32:
            this.toggleMode();
            break;
          // LEFT_ARROW
          case 37:
            this.prev();
            break;
          // UP_ARROW
          case 38:
            this.handleActions("zoomIn");
            break;
          // RIGHT_ARROW
          case 39:
            this.next();
            break;
          // DOWN_ARROW
          case 40:
            this.handleActions("zoomOut");
            break;
        }
      });
      on(document, "keydown", this._keyDownHandler);
    },
    deviceSupportUninstall() {
      off(document, "keydown", this._keyDownHandler);
      this._keyDownHandler = null;
    },
  },
  computed: {
    isSingle() {
      return this.urlList.length <= 1;
    },
    isFirst() {
      return this.index === 0;
    },
    isLast() {
      return this.index === this.urlList.length - 1;
    },
    currentImg() {
      return this.urlList[this.index];
    },
    imgStyle() {
      const { scale, deg, enableTransition } = this.transform;
      const style = {
        transform: `scale(${scale}) rotate(${deg}deg)`,
        transition: enableTransition ? "transform .3s" : "",
        "margin-left": `${this.imageLeft}px`,
        "margin-top": `${this.imageTop}px`,
      };
      if (this.mode === Mode.CONTAIN) {
        style.maxWidth = style.maxHeight = "100%";
      }
      return style;
    },
  },
  mounted() {
    this.deviceSupportInstall();
  },
};
</script>

<style scoped>
@import "./style/index.css";
.image-viewer__wrapper {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.image-viewer__mask {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0.5;
  background: #000;
}

.image-viewer__close {
  top: 40px;
  right: 40px;
  width: 50px;
  height: 50px;
  font-size: 24px;
  color: #fff;
  background-color: #606266;
  transition:all .3s linear;
}

.image-viewer__btn {
  position: absolute;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  opacity: 0.8;
  box-sizing: border-box;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
}

.image-viewer__btn {
  cursor: pointer;
}

.image-viewer__next,
.image-viewer__prev {
  width: 44px;
  height: 44px;
  font-size: 24px;
  color: #fff;
  background-color: #606266;
  border-color: #fff;
  top: 50%;
}

.image-viewer__prev {
  transform: translateY(-50%);
  left: 40px;
  text-indent: 2px;
}

.image-viewer__next {
  transform: translateY(-50%);
  right: 40px;
  text-indent: 2px;
}

.image-viewer__actions {
  left: 50%;
  bottom: 30px;
  transform: translateX(-50%);
  width: 282px;
  height: 44px;
  padding: 0 23px;
  background-color: #606266;
  border-color: #fff;
  border-radius: 22px;
}

.image-viewer__actions__inner {
  width: 100%;
  height: 100%;
  text-align: justify;
  cursor: default;
  font-size: 23px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.image-viewer__canvas {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

img {
  overflow-clip-margin: content-box;
  overflow: clip;
}
</style>
