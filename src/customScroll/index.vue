<template>
  <div class="scroll-container"
       ref="scrollContainer"
       :class="{'fade':fade}"
       @mousewheel="addWheelEvent($event,container)"
       @DOMMouseScroll="addWheelEvent($event,container)">
    <div class="scroll-wrapper" ref="scrollWrap">
      <slot></slot>
    </div>
    <div class="scroll-area-x" ref="scrollAreaX" v-show="isBarShowX" @click="barClickX">
      <div class="scroll-bar-x" ref="scrollBarX" @click.stop @mousedown="barRollX"></div>
    </div>
    <div class="scroll-area" ref="scrollArea" v-show="isBarShow" @click="barClick">
      <div class="scroll-bar" ref="scrollBar" @click.stop @mousedown="barRoll"></div>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      //滚动条是否随鼠标hover才出现
      fade: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        isBarShow: false,//滚动条是否显示
        isBarShowX: false,//横向滚动条是否显示
        container: "",//容器
        wrap: "",//内容
        //纵向
        area: "",//滚动条区域
        bar: "",//滚动条
        containerHigh: 0,//容器高度
        wrapHigh: 0,//内容高度
        barMaxTop: 0,//滚动条最大top
        conMaxTop: 0,//内容最大top
        prop: 0,//比例
        //横向
        areaX: "",//滚动条区域
        barX: "",//滚动条
        containerWide: 0,//容器宽度
        wrapWide: 0,//内容宽度
        barMaxLeft: 0,//滚动条最大left
        conMaxLeft: 0,//内容最大left
        propX: 0//比例
      };
    },
    mounted() {
      this.container = this.$refs.scrollContainer;
      this.wrap = this.$refs.scrollWrap;
      this.initY();
      this.initX();
    },
    methods: {
      /** 初始化纵向滚动条 */
      initY() {
        this.area = this.$refs.scrollArea;
        this.bar = this.$refs.scrollBar;
        this.containerHigh = this.container.clientHeight;
        this.wrapHigh = this.wrap.clientHeight;
        if (this.wrapHigh <= this.containerHigh) return;//如果内容高度小于等于盒子高度则没有滚动条
        this.bar.style.height = Math.pow(this.containerHigh, 2) / this.wrapHigh + "px";//设定高度
        this.isBarShow = true;

        this.$nextTick(() => {
          !this.isBarShowX && (this.container.style.paddingRight = this.area.clientWidth + "px");//只有Y滚动条时
          this.barMaxTop = this.area.clientHeight - this.bar.clientHeight;//滚动条最大top
          this.conMaxTop = this.wrapHigh - this.containerHigh + this.$refs.scrollAreaX.clientHeight;//内容最大top
          this.prop = this.barMaxTop / this.conMaxTop;//比例
        });
      },
      /** 初始化横向滚动条 */
      initX() {
        this.areaX = this.$refs.scrollAreaX;//获取滚动条区域
        this.barX = this.$refs.scrollBarX;//获取滚动条
        this.containerWide = this.container.clientWidth;
        this.wrapWide = this.wrap.clientWidth;
        if (this.wrapWide <= this.containerWide) return;//如果内容宽度小于等于盒子宽度则没有滚动条
        this.barX.style.width = Math.pow(this.containerWide, 2) / this.wrapWide + "px";//设定宽度
        this.isBarShowX = true;

        this.$nextTick(() => {
          !this.isBarShow && (this.container.style.paddingBottom = this.areaX.clientHeight + "px");//只有X滚动条时
          this.barMaxLeft = this.areaX.clientWidth - this.barX.clientWidth - (this.isBarShow && this.area.clientWidth || 0);//滚动条最大left，若有Y滚动条需要减去它的宽
          this.conMaxLeft = this.wrapWide - this.containerWide + this.area.clientWidth;//内容最大left
          this.propX = this.barMaxLeft / this.conMaxLeft;//比例
        });
      },
      /** 拖动横向滚动条 */
      barRollX(e) {
        e = e || window.event;
        let sX = e.clientX,//鼠标到文档left距离
          _this = this;//存储vue的this
        document.onmousemove = function (e) {
          _this.wrap.style.userSelect = "none";
          e = e || window.event;
          let nX = e.clientX;
          _this.changeLeft(nX - sX);
          sX = e.clientX;//给初始clientX重新赋值
        };
        document.onmouseup = function () {
          _this.wrap.style.userSelect = "auto";
          this.onmousemove = null;
        };
      },
      /** 拖动纵向滚动条 */
      barRoll(e) {
        e = e || window.event;
        let sY = e.clientY,//鼠标到文档top距离
          _this = this;//存储vue的this
        document.onmousemove = function (e) {
          _this.wrap.style.userSelect = "none";
          e = e || window.event;
          let nY = e.clientY;
          _this.changeTop(nY - sY);
          sY = e.clientY;//给初始clientY重新赋值
        };
        document.onmouseup = function () {
          _this.wrap.style.userSelect = "auto";
          this.onmousemove = null;
        };
      },
      /** 点击横向滚动条 */
      barClickX(e) {
        e = e || window.event;
        let cX = e.clientX,//鼠标到文档left距离
          barLeft = this.getLeft(this.barX) - (document.documentElement.scrollLeft || document.body.scrollLeft);//获取上一次滚动条left值
        this.changeLeft(cX - barLeft - this.barX.clientWidth / 2);
      },
      /** 点击纵向滚动条 */
      barClick(e) {
        e = e || window.event;
        let cY = e.clientY,//鼠标到文档top距离
          barTop = this.getTop(this.bar) - (document.documentElement.scrollTop || document.body.scrollTop);//获取上一次滚动条top值
        this.changeTop(cY - barTop - this.bar.clientHeight / 2);
      },
      /** left的改变
       * @x {Number} 滚动条left与下次滚动间的距离
       * */
      changeLeft(x) {
        //滚动条相关
        let barLeft = this.barX.offsetLeft + x;
        barLeft = Math.max(barLeft, 0);//滚动条到达顶部
        barLeft = Math.min(barLeft, this.barMaxLeft);//到达底部
        this.barX.style.left = barLeft + "px";

        //内容相关
        let conLeft = this.wrap.offsetLeft - x / this.propX;//传参的时候已经预先d*prop了，所以这里要除去
        conLeft = Math.max(-conLeft, 0);//内容到达顶部
        conLeft = -Math.min(conLeft, this.conMaxLeft);//到达底部
        this.wrap.style.left = conLeft + "px";
      },
      /** top的改变
       * @y {Number} 滚动条top与下次滚动间的距离
       * */
      changeTop(y) {
        //滚动条相关
        let barTop = this.bar.offsetTop + y;
        barTop = Math.max(barTop, 0);//滚动条到达顶部
        barTop = Math.min(barTop, this.barMaxTop);//到达底部
        this.bar.style.top = barTop + "px";

        //内容相关
        let conTop = this.wrap.offsetTop - y / this.prop;//传参的时候已经预先d*prop了，所以这里要除去
        conTop = Math.max(-conTop, 0);//内容到达顶部
        conTop = -Math.min(conTop, this.conMaxTop);//到达底部
        this.wrap.style.top = conTop + "px";
      },
      /** 获取滚动条left到document的left的距离
       * @obj {Object} 滚动条
       * @return {Number} 返回滚动条点击前left距document的距离
       * */
      getLeft(obj) {
        let l = 0;
        //因为bar到area到container再到container的父级是3层，所以循环3次
        for (let i = 0; i < 3; i++) {
          l += obj.offsetLeft;
          obj = obj.parentNode;
        }
        return l;
      },
      /** 获取滚动条top到document的top的距离
       * @obj {Object} 滚动条
       * @return {Number} 返回滚动条点击前top距document的距离
       * */
      getTop(obj) {
        let t = 0;
        //因为bar到area到container再到container的父级是3层，所以循环3次
        for (let i = 0; i < 3; i++) {
          t += obj.offsetTop;
          obj = obj.parentNode;
        }
        return t;
      },
      /** 滚轮事件的绑定
       * @obj {Object} 盛放内容的盒子
       * */
      addWheelEvent(e, obj) {
        e = e || window.event;
        let _this = this;
        //向上滚为负向下滚为正，如果函数返回false也就是想要阻止冒泡
        if (rollSpeed.call(obj, e = e || window.event, -e.wheelDelta / 120 || e.detail / 3) === false) {
          e.preventDefault();
          return false;
        }

        function rollSpeed(e, d) {
          d *= 30;//滚动速度
          _this.changeTop(d * _this.prop);
          e.preventDefault();
          return false;
        }
      }
    }
  };
</script>

<style lang="less">
  .scroll-container {
    overflow: hidden;
    position: relative;
    border: 1px solid #ddd;
    border-radius: 5px;
    &.fade {
      .scroll-area-x, .scroll-bar-x, .scroll-area, .scroll-bar {
        opacity: 0;
      }
      &:hover {
        .scroll-area-x, .scroll-bar-x, .scroll-area, .scroll-bar {
          opacity: 1;
        }
      }
    }
  }

  .scroll-wrapper {
    position: absolute;
    top: 0;
    left: 0;
  }

  .scroll-area-x, .scroll-bar-x {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 12px;
    background-color: #ecf5ff;
    transition: opacity .4s
  }

  .scroll-bar-x {
    height: 100%;
    background-color: #409eff;
    border-radius: 5px;
  }

  .scroll-area, .scroll-bar {
    position: absolute;
    right: 0;
    top: 0;
    width: 12px;
    height: 100%;
    background-color: #ecf5ff;
    transition: opacity .4s
  }

  .scroll-bar {
    width: 100%;
    background-color: #409eff;
    border-radius: 5px;
  }
</style>
