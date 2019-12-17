# 《领略 Angular 之美》

## 简介

面向对象：了解或简单实践过 Angular，想要了解更多实现原理或者使用技巧的开发者。

书籍定位：Angular 进阶指南，排错指南，比官方文档更注重实现原理和使用技巧。··

编写进度：目前 2/23。

> 已经找到志同道合的朋友一起编写同名开源电子书(前两章将会重新编写)，欢迎持续关注。

## 章节

### [第 01 章：变更检测](https://github.com/olivewind/angular-deep/issues/1)

* 前端框架如何实现变更的检测
* ng2 相比 ng1 如何做到性能大幅度提升
* 变更检测实现原理：`zone.js`
* 变更检测策略
* 干预变更检测

### [第 02 章：依赖注入](https://github.com/olivewind/angular-deep/issues/2)

* 什么是依赖注入
* 依赖注入的实现原理
* DI 正确使用姿势
    * 定义一个服务
    * 摇树优化
    * 通过 Constructor 注入服务
    * 通过 Injector 注入服务
    * 组件的注入

### 第 03 章：Rxjs
* 基本使用
* 常用操作符
* 使用技巧
* 调试技巧
* 自己实现一个 Rxjs
* 在 Angular 里使用 Rxjs

### 第 04 章：模块

### 第 05 章：指令
* 结构型指令
* 属性型指令
* 自定义指令
* 内置指令实现原理
    * `ngIf`
    * `ngClass`
    * `ngStyle`
    * `ngFor`
    * `ngSwitch`

### 第 06 章：组件
* 基本使用
    * 基本语法
    * 输入和输出
    * 表达式操作符
    * 模板引用变量
    * 上下文
* 双向数据绑定
* 模板语法 vs JSX
* 生命周期
* 组件引用
    * `@ViewChild`
    * `@ContentChild`
* 内容投影
* 组件的样式
    * 样式编写方式
    * 样式封装策略
        * Native
        * ShadowDom
        * Emulated
        * None
    * 特殊的选择器
        * :host
        * :host-context
* 动态组件和懒加载组件
* Web Component

### 第 07 章：管道
* 基本使用
* 纯管道
* 非纯管道
* 自定义管道
* 管道的内部实现

### 第 08 章：表单
* `ControlValueAccessor` 做了哪些事情
    * 变更视图
    * 响应视图变更
    * 表单模型
* 响应式表单和模板驱动表单中的数据流
    * 响应式表单
        * FormControlDirective
        * 从视图到模型
        * 从模型到视图
    * 模板驱动表单
* NgModel
    * 从视图到模型
    * 从模型到视图
* Angular 表单的设计哲学
    * 对比 React 表单
* 创建一个表单控件
    * 指令方式
    * 组件方式

### 第 09 章：路由导航
* 路由的作用
* 路由的使用
    * 基本配置
    * 嵌套路由
    * 重定向
    * 多路由出口
    * 懒加载路由及其实现
    * 路由的切换
        * 编程式切换
        * 声明式切换
    * 参数传递
    * 路由预加载
    * 路由复用
    * 路由钩子
* 路由守卫
* 路由的实现
    * 使用 hash 实现
    * 使用 history 实现
    * 路由指令的实现
        * `<router-link>`
        * `<router-link-active>`
        * `<router-link-with-href>`
        * `<router-outlet>`
* 路由组织最佳实践

### 第 10 章：Http Client
* 基本使用
* 基于 Observable 的实现
* 拦截器的实现原理

### 第 11 章：动画
* 动画要点
    * Angular 的动画系统是基于 CSS 功能构建的
    * 状态 state() 和样式 style()
    * 转场动画
    * *，void， :enter， :leave， :increment， :decrement
    * 动画回调
* 高阶动画函数与路由动画
    * query()，stager()
    * group()，sequence()
    * 父子动画
    * 路由动画
    * 使用 AnimationOptions 接口创建可复用的动画
* 命令式与声明式动画
* @angular/animations 设计哲学
* @angular/animations/browser 与跨平台动画渲染
* 基于 WAAPI 构建高性能 Angular 动画

### 第 12 章：性能优化

### 第 13 章：Ivy 渲染引擎

### 第 14 章：Bazel 和 Webpack

### 第 15 章：CDK(Component Dev Kit)

### 第 16 章：Angular Cli

### 第 17 章：Schematics

### 第 18 章：构建和发布 Angular 第三方库

### 第 19 章：大型项目最佳实践：目录组织

### 第 20 章：大型项目最佳实践：分层架构

### 第 21 章：另外 - 测试

### 第 22 章：另外 - 安全

### 第 23 章：另外 - 国际化

### 第 24 章：另外 - 服务端渲染

### 第 25 章：另外 - 构建与优化

### 第 26 章：另外 - 升级
