# 第 1 节：基本概念

### 1.1 什么是变更检测

  变更检测是一种通过检测程序内部状态的改变，并将其呈现到 UI 界面的的一种机制。这种状态可以是任何类型的对象、数组、原语等，即任何类型的 javascript 数据结构。这些状态一般以图像、表单、链接或者按钮的形式出现在用户界面中，尤其是web应用中，即 DOM。一般来说，我们使用数据结构作为输入，DOM 作为输出呈现给用户。
  
  然而，当状态发生变化时，情况会变得更加复杂。当 DOM 被渲染后，我们怎么知道我们的模型已经发生了变化，或者我们应该在哪里更新 DOM。直接获取 DOM 树是很昂贵的，因此我们不仅要知道什么时候需要更新 DOM，我们还得让获取的成本最小化。这可以有不同的方式进行跟踪。一种方式是，例如简单的通过请求的方式重新渲染整个页面。另一种方法是找出当前状态和上一个状态的不同之处，然后只渲染这一部分。这就像 reactjs 中的 虚拟 DOM 一样。

### 1.2 什么时候会触发变更检测

  应用状态的改变由三种事件触发：

  - Events：如 `click`, `change`, `input`, `submit` 等用户事件
  - XMLHttpRequests：比如从远端服务获取数据
  - Timers： 比如 JavaScript 的自有 API `setTimeout()`, `setInterval()` 

  这三种事件都有一个共同的特点：都是异步事件。因此可以得出总结，当异步操作执行后，应用的状态也会随之改变。这个时候就会通知 angular 去更新视图了。

### 1.3 JS 框架简单对比

  #### React: Vitual DOM

  "我不知道什么改变了，所以我会重新渲染一切，看看现在有什么不同。"

  纯 react 会将检测到的变化重新渲染成一整颗虚拟 DOM 树，然后和之前的版本进行比较。只要有变化，就会被应用到真正的 DOM 树中。

  #### Angular 2: zonejs

  Angular 程序是一个一个组件组成的，而每个组件都有一个单独的检测器。Angualr 在运行时会为每一个组件都创建一个变更检测器。在 angular 的源码中，有一个 ApplicationRef 用于监听 NgZone 的 onTurnDone 事件，无论什么时候这个事件被触发，都会执行 tick() 方法，这个函数就是用来执行变更检测的。

   ```
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

  #### AngularJS

  “我不知道什么发生了变化，因此我会检测所有可能会更新的东西。”

  Angular.js 通过重新渲染页面中绑定的数据，来确定数据是否发生了变化。
  


  

