# 第 2 节：路由的使用

### 2.1 基本使用

  Angular 的路由是基于配置的，因此我们可以使用非常简单的方式来组织我们的应用，通常只要以下几步

#### 2.1.1 配置路由表

``` typescript
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'a-page',
    component: APageComponent
  },
  {
    path: 'b-page',
    component: BPageComponent
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
})
export class AppModule { }
```

#### 2.1.2 配置路由出口

``` html
<router-outlet></router-outlet>
```

#### 2.1.3 访问 `/a-page` 和 `/b-page` 即可访问到对应组件

### 2.2 嵌套路由

2.2.1 调整路由配置

``` typescript
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'parent-page',
    component: ParentPageComponent，
    children: [
      {
        path: 'child1-page',
        component: Child1PageComponent，
      },
      {
        path: 'child2-page',
        component: Child2PageComponent，
      },
    ],
  },
];
```
  

2.2.2 在 `parent-page` 中添加路由出口

``` html
<router-outlet></router-outlet>
```

2.2.3 访问 `/parent-page/child1-page` 即可访问到对应组件

### 2.3 重定向

``` typescript
const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/home'
  },
];
```

注意这里使用到了通配符 `**`  需要，在路由器自上而下匹配过程中发现请求的 URL 不匹配前面定义的路由表中的任何路径时，路由器就会选择此路由。

### 2.4 多路由出口

#TODO

### 2.5 懒加载路由及其实现

为了优化应用首屏加载速度，通常我们会对路由实行懒加载，只有路由激活的时候才真正去加载相关代码，在 Angular 中只需要对路由稍作调整即可实现路由懒加载

``` typescript
const routes: Routes = [
  {
    path: 'module-a',
    loadChildren: () => import('./module-a/module-a.module').then(m => m.ModuleAModule),
  },
  {
    path: 'module-b',
    loadChildren: () => import('./module-b/module-b.module').then(m => m.ModuleBModule),
  },
];
```

注意到上面的代码中出现了 `import('module')` 的语法，该方法将会动态加载一个 JavaScript 文件并返回一个 Promise，正是它帮我们实现了路由懒加载

实际上 `import('module')` 语法还只有少量浏览器版本，比如 Chorme 63 以上版本被支持，那为何我们还可以使用呢？实际上这多亏了打包工具 Webpack，实际上这一切的背后并没有什么魔法，其原理非常简单，我们可以写一个简单 [Webpack Demo](./webpack-lazyload) 来一探究竟


``` javascript
// lazyload.js
console.log('hello world');

```

``` javascript
// main.js
setTimeout(() => {
  console.log('app start');
  import('./lazyload')
    .then((m) => {
      console.log(m.hello());
    });
}, 2000);
```

该程序会在两秒钟后懒加载一个模块，并调用其中 `hello` 函数，打开浏览器我们可以看到

![image](https://user-images.githubusercontent.com/17901361/76287969-9ded6a80-62e0-11ea-8a54-ab02f19d1ed5.png)

查看网路请求可以看到动态请求了一段脚本如下

``` javascript
(window.webpackJsonp=window.webpackJsonp||[]).push([[1],[,function(o,n,c){"use strict";function e(){console.log("hello world")}c.r(n),c.d(n,"hello",(function(){return e}))}]]);
```

其中一个关键词是 `webpackJsonp`，我们再看一下 dom 结构就更加明了了

![image](https://user-images.githubusercontent.com/17901361/76287734-1dc70500-62e0-11ea-9d3c-598d3794e8cd.png)

`main.js 执行` ->  `等待两秒` ->  `通过 script 标签加载 js` -> `通过 jsonp(回调)的方式取得模块内容` -> `执行 hello 方法`


### 2.6 路由切换

- 2.5.1 编程式切换路由

  通过 `navigateByUrl`

  通过 `navigate`

- 2.5.2 声明式切换路由

    通过 `routerLink`

### 2.7 参数传递

### 2.8 路由预加载

路由懒加载非常适合于初始页面，但它也可能会降低我们的导航速度，此时你可以使用路由预加载技术，Router 模块提供了 `preloadingStrategy` 属性，该属性勇于预加载的策略，有两种内置

TODO: 参考，quick-link 源码解析

[https://web.dev/route-preloading-in-angular/](https://web.dev/route-preloading-in-angular/)

[https://github.com/deepthan/blog-angular/issues/4](https://github.com/deepthan/blog-angular/issues/4)

### 2.9 路由复用

### 2.10 路由事件

对于路由事件的监听，在某些场景下是有价值的，尤其是在用户数据统计的时候，在 Angular 的路由模块下这很简单，只需要简单的订阅即可

``` typescript
import { Component } from '@angular/core';
import { Router, Event } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  constructor(
    router: Router
  ) {
    // 记得在组件销毁的时候取消订阅
    router.events.subscribe((e: Event) => {
      console.log(e);
    });
    
  }
}
```