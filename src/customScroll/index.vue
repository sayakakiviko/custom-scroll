<template>
  <div class="scroll-container" ref="scrollContainer"
       @mousewheel="addWheelEvent($event,container)"
       @DOMMouseScroll="addWheelEvent($event,container)">
    <div class="scroll-wrapper" ref="scrollWrap">
      <slot></slot>
    </div>
    <div class="scroll-area" ref="scrollArea" v-show="isBarShow" @click="barClick($event)">
      <div class="scroll-bar" ref="scrollBar" @mousedown="barRoll($event)" @click.stop></div>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        isBarShow: false,//滚动条是否显示
        container: '',//容器
        wrap: '',//内容
        area: '',//滚动条区域
        bar: '',//滚动条
        containerHigh: 0,//容器高度
        wrapHigh: 0,//内容高度
        barMaxTop: 0,//滚动条最大top
        conMaxTop: 0,//内容最大top
        prop: 0,//比例
      };
    },
    mounted() {
      this.init();
    },
    methods: {
      /** 初始化滚动条 */
      init() {
        this.container = this.$refs.scrollContainer;
        this.wrap = this.$refs.scrollWrap;
        this.area = this.$refs.scrollArea;
        this.bar = this.$refs.scrollBar;
        this.containerHigh = this.container.clientHeight;
        this.wrapHigh = this.wrap.clientHeight;
        if (this.wrapHigh <= this.containerHigh) return false;//如果内容高度小于等于盒子高度则没有滚动条

        this.bar.style.height = Math.pow(this.containerHigh, 2) / this.wrapHigh + 'px';//设定高度
        this.isBarShow = true;
        this.$nextTick(function () {
          this.barMaxTop = this.area.clientHeight - this.bar.clientHeight;//滚动条最大top
          this.conMaxTop = this.wrapHigh - this.containerHigh;//内容最大top
          this.prop = this.barMaxTop / this.conMaxTop;//比例
        });
      },

      /** 按住拖动滚动条 */
      barRoll(e) {
        e = e || window.event;
        let sY = e.clientY,//鼠标到文档top距离
          _this = this;//存储vue的this
        document.onmousemove = function (e) {
          _this.wrap.style.userSelect = 'none';
          e = e || window.event;
          let nY = e.clientY;
          _this.changeTop(nY - sY);
          sY = e.clientY;//给初始clientY重新赋值
        };
        document.onmouseup = function () {
          _this.wrap.style.userSelect = 'auto';
          this.onmousemove = null;
        };
      },

      /** 点击 */
      barClick(e) {
        e = e || window.event;
        let cY = e.clientY,//鼠标到文档top距离
          barTop = this.getTop(this.bar) - document.documentElement.scrollTop || document.body.scrollTop;//获取滚动条top值
        this.changeTop(cY - barTop - this.bar.clientHeight / 2);
      },

      /** top的改变
       * @x {Number} 滚动条top与下次滚动间的距离
       * */
      changeTop(x) {
        //滚动条相关
        let barTop = this.bar.offsetTop + x;
        barTop = Math.max(barTop, 0);//滚动条到达顶部
        barTop = Math.min(barTop, this.barMaxTop);//到达底部
        this.bar.style.top = barTop + 'px';

        //内容相关
        let conTop = this.wrap.offsetTop - x / this.prop;//传参的时候已经预先d*prop了，所以这里要除去
        conTop = Math.max(-conTop, 0);//内容到达顶部
        conTop = -Math.min(conTop, this.conMaxTop);//到达底部
        this.wrap.style.top = conTop + 'px';
      },

      /** 获取元素top到document的top的距离，需遍历该元素及其所有父级(body为止，不含body)到document的top的距离
       * @obj {Object} 滚动条
       * @return {Number} 返回的是滚动条点击前top距document的距离
       * */
      getTop(obj) {
        let t = 0;
        while (obj !== document.body) {
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
    overflow-y: hidden;
    position: relative;
    border: 1px solid #ddd;
    border-radius: 5px;
  }

  .scroll-wrapper {
    position: absolute;
    top: 0;
    left: 0;
  }

  .scroll-area, .scroll-bar {
    position: absolute;
    top: 0;
    right: 0;
    width: 12px;
    height: 100%;
    background-color: #ecf5ff;
  }

  .scroll-bar {
    width: 100%;
    background-color: #409eff;
    border-radius: 5px;
  }
</style>
