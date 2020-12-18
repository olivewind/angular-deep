# 变更检测

[TOC]

## 什么是变更检测

1. 概念

   1.  变更检测最基础的任务就是将程序内部的状态以UI界面的方式呈现。这种状态可以是任何类型的对象、数组、原语。。。总之，任何类型 js 数据结构。这些状态一般以图像、表单、链接或者按钮的形式出现在用户界面中，尤其是web应用中，即 DOM。一般来说，我们使用数据结构作为输入，DOM 作为输出呈现给用户。然而，当状态发生变化时，情况会变得更加复杂。当 DOM 被渲染后，我们怎么知道我们的模型已经发生了变化，或者我们应该在哪里更新 DOM。直接获取 DOM 树是很昂贵的，因此我们不仅要知道什么时候需要更新 DOM，我们还得让获取的成本最小化。这可以有不同的方式进行跟踪。一种方式是，例如简单的通过请求的方式重新渲染整个页面。另一种方法是找出当前状态和上一个状态的不同之处，然后只渲染这一部分。这就像 reactjs 中的 虚拟 DOM 一样。

2. 三种机制

   1. DOM元素变更机制  https://zhuanlan.zhihu.com/p/96640047 知乎解析，主要讲了下源码
      1. 程序内部表现
         1. 视图 Angular 编译器会为程序中使用的每个组件编译生成一个**工厂**（factory）
      2. 疑问：
         1. 组件类型？每个里面都有一个 view definition 实例，用于充当所有视图的模版。组件实例？单独视图？
         2. 模版解释——>视图节点——>组件工厂
         3. angular 编译器？
         4. 节点类型？（元素节点、文本节点、指令节点？）angular 如何根据节点类型处理更新？
            1. 元素节点定义？文本节点的生成和定义？
            2. 节点上的属性如何进行绑定呢？
               1. 使用bindings 来定义每一个节点的绑定依赖，而这些绑定通常是组件内的属性
               2. 在变更检测时 Angular 会根据每个绑定来决定 angular 采取何种操作更新节点和提供上下文信息。
      3. 总结：程序是由一堆视图组成的，而不同的视图又是由不同类型的节点组成的

3. 什么时候会触发变更检测？

   1. 应用状态的改变由三种事件触发：

      - Events：如 `click`, `change`, `input`, `submit` 等用户事件

      - XMLHttpRequests：比如从远端服务获取数据

      - Timers： 比如 JavaScript 的自有 API `setTimeout()`, `setInterval()` 

        这三种事件都有一个共同的特点：都是异步事件。因此可以得出总结，当异步操作执行后，应用的状态也会随之改变。这个时候就会通知angular去更新视图了。

   2. 实际上，告知 Angular 每当完成VM turn 时执行更改检测的代码如下：

   ```
   ObservableWrapper.subscribe(this.zone.onTurnDone, () => {
     this.zone.run(() => {
       this.tick();
     });
   });
   
   tick() {
     // perform change detection
     this.changeDetectorRefs.forEach((detector) => {
       detector.detectChanges();
     });
   }
   ```

   

4. 变更检测可视化 https://alexzuza.github.io/ivy-cd/ 

   基本元素：

   1. 视图 view 是主要的底层抽象，例子中 view 的机构？View用来描述模版，包含了反映模版结构的数据
   2. view engine 使用 view definition factory 创建节点，并将节点存储在视图定义的 nodes 中；

   变更检测：

   1. ChangeDerectorRef 是一个抽象类，包含两个抽象方法`detectChanges`和`markForCheck. ` 当我们在组件的构造器中注入 changeDirectorRef 时，实际上是从  changeDirectorRef 类拓展所得的 ViewRef

   2. Ivy 中真正运行变更检测机制的内部方法：![image-20200106221802301](/Users/lihe/Library/Application Support/typora-user-images/image-20200106221802301.png)

      具体方法介绍，参考文档

   3. 变更检测的错误 （就是这几个错误，才会引起变更检测的循环吧）

      1. Angular 首先检测子组件，然后检测嵌入的视图。（这里不是很懂诶）

   4. one time string initialization 一次性字符串初始化

   5. angular 不再为容器创建 text nodes

   6. Increment DOM from scratch（所以 IDOM 的核心理念就是使用真实的 DOM 与 new tree 进行比较。）深度优先遍历 这个需要仔细讲解么？

## 变更检测的原理（先了解再深入）

1. angular中的变更检测是怎么实现的

   1. who notifies angular？ ngZone and zones, in each angular component, they have their own change detector.
   2. **Angular creates change detector classes at runtime** for each component
   3. angular 1 is cycles angular 2 is tree

   ```
   // very simplified version of actual source
   // 在 angular 的源码中，有一个 ApplicationRef 用于监听 NgZone 的 onTurnDone 事件，无论什么时候这个事件被触发，都会执行 tick() 方法，这个函数就是用来执行变更检测的。
   class ApplicationRef {
   
     changeDetectorRefs:ChangeDetectorRef[] = [];
   
     constructor(private zone: NgZone) {
       this.zone.onTurnDone
         .subscribe(() => this.zone.run(() => this.tick());
     }
   
     tick() {
       this.changeDetectorRefs
         .forEach((ref) => ref.detectChanges());
     }
   }
   ```

   change direction

   现在我们知道了 变更检测是什么时候触发的，但它到底是如何执行的呢？第一件事情我们需要明确的是，在 angular 中，每个组件都有他们的变更检测器。单独控制的话，更加灵活。举个例子，当有一个button 按钮被点击时，zones会通知angular然后执行变更检测。每个组件拥有一个变更检测器，而angular应用又是组件树组成的，由此可见，我们会得到一颗变更检测树。这棵树也可以被看成是一个有向图，数据流从上往下。

   数据从上到下流动的原因是，对于每个组件，每次从根组件开始，也总是从上到下执行变更检测。这非常棒，因为单向数据流比循环更容易预测。我们总是知道我们在视图中使用的数据来自何处，因为它只能由其组件产生。

   另一个有趣的发现是，变更检测在单次传递之后变得稳定。这意味着，如果我们的一个组件在第一次运行之后，在变更检测过程中产生了任何附加的副作用，Angular将抛出一个错误。



​	performance （性能）

angular 会生成VMs友好的代码。为什么不用一个通用的东西去控制每个单独组件的状态呢？因为 VMs 不能优化这种多态的代码，而对于 angular 单独组件是单型的，VMs 能够完美的优化。（类似一对多，多对多的情况）



smarter change detection



 **Immutables** and **Observables**

 **If there’s a change, we get a new reference**.

immutables/onPush 优化性能。不可变对象使用ChangeDetectionStrategy.OnPush 只检测变化的地方，是能优化性能的。（跳过下面的变更检测步骤）



Observables，需要深入了解的可以看✅ https://blog.thoughtram.io/angular/2016/01/06/taking-advantage-of-observables-in-angular2.html rx 实践（debounceTime， distinctUntilChanged， switchMap）

```
constructor(private cd: ChangeDetectorRef) {}

ngOnInit() {
  this.addItemStream.subscribe(() => {
    this.counter++; // application state changed
    this.cd.markForCheck(); // marks path
  })
}
```

The demos:

https://github.com/thoughtram/angular2-change-detection-demos





## 什么是zonejs

1. 深入zonejs

## angular 中修改变更检测的方式

1. 分类
2. 不同方式具体介绍
3. 应用场景（什么时候用何种方式）

## 前端三大框架变更检测方式分别是如何实现的

对比 http://teropa.info/blog/2015/03/02/change-and-its-detection-in-javascript-frameworks.html

1. react 实现方式
2. vue 实现方式

问题：

1. Get set 触发的变更检测死循环；
2. 在属性中使用函数影响循环





参考文档



1. [变更检测是深度优先还是广度优先遍历](https://zhuanlan.zhihu.com/p/97480400)
2. [angular ivy 执行变更检测](https://zhuanlan.zhihu.com/p/95933185)
3. change-detection-explained  https://blog.thoughtram.io/angular/2016/02/22/angular-2-change-detection-explained.html 这篇文章真挺好的，入门了解变更检测✅

