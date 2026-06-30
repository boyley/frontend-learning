/**
 * template-driven.component.ts
 * ------------------------------------------------------------------
 * 模板驱动表单（Template-driven Forms）：表单模型由模板里的指令「隐式」创建。
 *
 * 适合：简单表单、快速原型。
 * 核心：FormsModule + [(ngModel)] 双向绑定 + 模板里的 required 等原生属性做校验。
 *
 * 与响应式表单对比：写起来更简单，但逻辑都在模板里，难做复杂动态校验与单元测试。
 */
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // 模板驱动表单必备（提供 ngModel）

@Component({
  selector: 'app-template-driven',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="template-form">
      <h3>模板驱动表单（Template-driven）</h3>

      <!-- #f="ngForm" 把整个表单导出为模板引用变量，便于读取 f.valid -->
      <form #f="ngForm" (ngSubmit)="onSubmit()">
        <div class="field">
          <label>昵称：</label>
          <!--
            [(ngModel)] 双向绑定到组件属性 nickname；
            name 必填（ngModel 注册控件需要）；
            required/minlength 是原生属性，由 Angular 转成校验器；
            #nick="ngModel" 导出该控件，便于读取 nick.invalid/touched
          -->
          <input
            name="nickname"
            [(ngModel)]="nickname"
            #nick="ngModel"
            required
            minlength="2"
          />
          @if (nick.invalid && nick.touched) {
            <div class="error">昵称必填且至少 2 个字符</div>
          }
        </div>

        <button type="submit" [disabled]="f.invalid">提交</button>
      </form>

      <p>当前值：{{ nickname }}</p>
      @if (result) { <p class="ok">提交成功：{{ result }}</p> }
    </section>
  `,
})
export class TemplateDrivenComponent {
  nickname = ''; // 直接用普通属性承载表单值
  result = '';

  onSubmit(): void {
    this.result = this.nickname;
  }
}
