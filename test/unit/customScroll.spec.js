/* 引入依赖 */
import {mount} from '@vue/test-utils';
import customScroll from '../../src/customScroll/index.vue';

/* 测试用例 */
describe('\n====== customScroll组件测试 ======\n', () => {
  const instance = mount(customScroll, {
    propsData: {},
    scopedSlots: {
      default: '<template slot-scope="scope"><span class="operate insert">新增</span></template>'
    }
  });
  var container = instance.find('.scroll-container'),
    wrap = instance.find('.scroll-wrapper');

  it('组件是否渲染成功', () => {
    expect(container.classes()).toContain('scroll-container');
  });
  it('内容是否填充', () => {
    expect(container.find('.scroll-wrapper').html());
  });
  it('插槽传值是否成功', () => {
    expect(wrap.html()).toContain('新增');
  });
  /*it('文字溢出时是否出现【更多】按钮', () => {
    setTimeout(()=>{
      const con = wrapper.find('.ellipsis-container');
      con.style.width='300px';
      expect(con.html()).toContain('【更多】');
    }, 10)
  });
  it('点击【更多】按钮是否展示全部文字', () => {
    const ele = wrapper.find('.ellipsis-more');
    ele.trigger('click');
    expect(wrapper.classes()).toContain('reveal')
  });
  it('点击【收起】按钮是否收起文字', () => {
    const ele = wrapper.find('.ellipsis-fold-text');
    ele.trigger('click');
    expect(wrapper.classes()).not.toContain('reveal')
  }); */
});
