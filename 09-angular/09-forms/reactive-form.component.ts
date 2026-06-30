/**
 * reactive-form.component.ts
 * ------------------------------------------------------------------
 * 响应式表单（Reactive Forms）：在 TS 里显式构建表单模型，模板绑定到模型。
 *
 * 适合：复杂表单、动态校验、需要单元测试的场景。
 * 核心类：
 *  - FormControl  : 单个字段（值 + 校验状态）
 *  - FormGroup    : 一组字段（整张表单）
 *  - FormBuilder  : 简化构建 FormGroup/FormControl 的语法糖
 *  - Validators   : 内置校验器（required/email/minLength...）
 *
 * 必须 imports ReactiveFormsModule，模板才能用 [formGroup]/formControlName。
 */
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-reactive-form',
  standalone: true,
  imports: [ReactiveFormsModule], // 响应式表单必备
  templateUrl: './reactive-form.component.html',
})
export class ReactiveFormComponent {
  private readonly fb = inject(FormBuilder);

  // 提交结果（用 signal 存放，便于模板响应式显示）
  readonly submitted = signal<string | null>(null);

  // 用 FormBuilder 构建表单模型：每个字段 = [初始值, 校验器(可数组)]
  readonly form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    age: [18, [Validators.required, Validators.min(1), Validators.max(120)]],
  });

  // 便捷 getter：在模板里少写 form.get('username')
  get username() {
    return this.form.controls.username;
  }
  get email() {
    return this.form.controls.email;
  }
  get age() {
    return this.form.controls.age;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      // 整表无效：把所有控件标记为 touched，让错误提示全部显示出来
      this.form.markAllAsTouched();
      return;
    }
    // 校验通过：form.value 即收集到的数据对象
    this.submitted.set(JSON.stringify(this.form.value));
  }

  reset(): void {
    this.form.reset({ username: '', email: '', age: 18 });
    this.submitted.set(null);
  }
}
