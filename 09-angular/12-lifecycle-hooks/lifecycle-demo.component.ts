import {
  Component,
  Input,
  OnInit,
  OnChanges,
  DoCheck,
  AfterContentInit,
  AfterContentChecked,
  AfterViewInit,
  AfterViewChecked,
  OnDestroy,
  SimpleChanges,
  inject,
  afterNextRender,
} from '@angular/core';

@Component({
  selector: 'app-lifecycle-demo',
  standalone: true,
  template: `
    <div class="box">
      <h3>生命周期演示子组件</h3>
      <p>收到的 label：{{ label }}</p>
      <p>计数器：{{ counter }}（点击触发变更检测，看 DoCheck 日志）</p>
      <button (click)="counter = counter + 1">+1</button>
    </div>
  `,
})
export class LifecycleDemoComponent
  implements
    OnChanges,
    OnInit,
    DoCheck,
    AfterContentInit,
    AfterContentChecked,
    AfterViewInit,
    AfterViewChecked,
    OnDestroy
{
  // 父组件通过 [label] 传入，label 变化会触发 ngOnChanges。
  @Input() label = '';

  counter = 0;

  // 1) constructor：类实例化时最先执行。此时 @Input 尚未赋值、视图也未创建。
  //    只做最简单的依赖注入，不要在这里访问输入属性或 DOM。
  constructor() {
    console.log('1. constructor —— 实例创建，@Input 尚未就绪');

    // afterNextRender：仅在浏览器端、下一次渲染完成后运行一次。
    // 适合做「需要真实 DOM」的一次性初始化（如读取元素尺寸、集成第三方库）。
    // 它替代了过去在 ngAfterViewInit 里操作 DOM 的部分场景，且 SSR 安全。
    afterNextRender(() => {
      console.log('   afterNextRender —— DOM 首次渲染完成（仅浏览器执行一次）');
    });
  }

  // 2) ngOnChanges：每当任一 @Input 值变化时调用（首次赋值也算，故先于 ngOnInit）。
  ngOnChanges(changes: SimpleChanges): void {
    console.log('2. ngOnChanges —— 输入属性变化', changes);
  }

  // 3) ngOnInit：组件初始化，@Input 已就位。只调用一次。
  //    放置「初始化逻辑」「发起首屏请求」「读取参数」的最佳位置。
  ngOnInit(): void {
    console.log('3. ngOnInit —— 输入就绪，做初始化（请求/订阅等）');
  }

  // 4) ngDoCheck：每一轮变更检测都会调用，非常频繁。慎用，逻辑要极轻。
  ngDoCheck(): void {
    console.log('4. ngDoCheck —— 每次变更检测都跑（高频）');
  }

  // 5) ngAfterContentInit：投影内容（<ng-content>）初始化完成后，调用一次。
  ngAfterContentInit(): void {
    console.log('5. ngAfterContentInit —— 投影内容就绪');
  }

  // 6) ngAfterContentChecked：每次投影内容被检查后调用。
  ngAfterContentChecked(): void {
    console.log('6. ngAfterContentChecked —— 投影内容检查完成');
  }

  // 7) ngAfterViewInit：组件自身视图 + 子视图初始化完成后，调用一次。
  //    此时可安全访问 @ViewChild 引用的 DOM/子组件。
  ngAfterViewInit(): void {
    console.log('7. ngAfterViewInit —— 视图就绪，可访问 ViewChild');
  }

  // 8) ngAfterViewChecked：每次视图被检查后调用。
  ngAfterViewChecked(): void {
    console.log('8. ngAfterViewChecked —— 视图检查完成');
  }

  // 9) ngOnDestroy：组件销毁前调用一次。
  //    在这里清理：取消订阅、清除定时器、移除事件监听，否则内存泄漏。
  ngOnDestroy(): void {
    console.log('9. ngOnDestroy —— 组件销毁，清理订阅/定时器');
  }
}
