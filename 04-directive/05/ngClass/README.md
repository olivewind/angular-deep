# NgClass 指令

### NgClass 的基本用法

有时候，我们想要根据条件来判断一个类名是否显示，会使用由 class 前缀，一个(.)和 CSS 类的名字组成的方式，比如说:

    <div [class.is-new]="isNew"> product </div>

这是个切换单一类名的好办法，不过当需要绑定多个类名的时候，我们更倾向于使用 NgClass 指令。

    <!-- Native Class and Style Attributes -->
    <div class="is-new my-product">  product </div>
    
    <!-- Angular class and style Bindings -->
    <div [class.is-new]="booleanProp" />  product </div>
    
    <!-- ngClass -->
    <input [ngClass]="{'is-danger': booleanProp, 'myButton': true}" >  product </div>
    

通过 NgClass 与 Angualr Property & Event Biding 相结合的方式，我们可以实现条件渲染出想要的类名。

NgClass 通过接收行内声明或者来自 typeScript 类的 属性/方法 的方式获取输入内容：

- string - 使用空格分隔的字符串中的 CSS 类添加进来，例如： `[ngClass]="is-new is-product"`
- Array - 会把数组中的各个元素作为CSS类添加进来,，例如 : `[ngClass]="['is-new', 'is-product']"`
- Object - key 为需要处理的 CSS 类，如果表达式的结果为 True 则为元素添加上此类名，否则移除，例如： `[ngClass]="{'is-new': true, 'is-product': true}"`

上面的这几个例子都是行内声明的，所以都可以被 TypeScript 的 属性/方法 所替换：

    export class tsCompoentClass {
    	tsStringProperty = "is-new is-product";
      tsArrayProperty = ['is-new', 'is-product';
      tsObjectProperty = {'is-new': true, 'is-product': true};
    }
    
    // 使用的时候
    [ngClass]="tsStringProperty"
    [ngClass]="tsArrayProperty"
    [ngClass]="tsObjectProperty"

当然，你也可以使用三元表达式，只要三元表达式可以返回有效的字符串/数组/对象。

### NgClass 的实现原理

如果你查阅了 Angular 源码就会发现，toggleClass() 方法经常性的会被 Angular 调用，尤其是它在完成以下繁重的边际准备工作之后。那么，这个 toggleClass() 具体是怎么实现的呢？

    // angluar 相关源码
    import {ElementRef, Injectable, IterableChanges, IterableDiffer, IterableDiffers, KeyValueChanges, KeyValueDiffer, KeyValueDiffers, Renderer2, ɵisListLikeIterable as isListLikeIterable, ɵstringify as stringify} from '@angular/core';
    
    import {StylingDiffer, StylingDifferOptions} from './styling_differ';
    
    ......
    constructor(
          private _iterableDiffers: IterableDiffers, private _keyValueDiffers: KeyValueDiffers,
          private _ngEl: ElementRef, private _renderer: Renderer2) {}
    ....
    
    private _toggleClass(klass: string, enabled: boolean): void {
        klass = klass.trim();
        if (klass) {
          klass.split(/\s+/g).forEach(klass => {
            if (enabled) {
              this._renderer.addClass(this._ngEl.nativeElement, klass);
            } else {
              this._renderer.removeClass(this._ngEl.nativeElement, klass);
            }
          });
        }
      }

我们可以很清楚的看到，toggleClass() 实际上是调用了 Angular 上的 Renderer2 对 nativeElement （即 ngClass 的宿主元素）执行了添加类名（addClass()）以及删除类名 （removerClass()）的操作。