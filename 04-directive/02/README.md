# 第 2 节：属性型指令

属性型指令用于改变一个 DOM 元素的外观或行为。属性型指令至少需要一个带有 @Directive 装饰器的控制类，该装饰器指定了一个用于标识属性的选择器，控制类实现了指令需要的指令行为。

首先，让我们看一个属性型指令的小例子：

    /* app/highlight.directive.ts */
    /* tslint:disable:member-ordering */
    import { Directive, ElementRef, HostListener, Input } from '@angular/core';
     
    @Directive({
      selector: '[appHighlight]'
    })
    export class HighlightDirective {
     
      constructor(private el: ElementRef) { }
     
      @Input() defaultColor: string;
     
      @Input('appHighlight') highlightColor: string;
     
      @HostListener('mouseenter') onMouseEnter() {
        this.highlight(this.highlightColor || this.defaultColor || 'red');
      }
     
      @HostListener('mouseleave') onMouseLeave() {
        this.highlight(null);
      }
     
      private highlight(color: string) {
        this.el.nativeElement.style.backgroundColor = color;
      }
    }

像是组件一样，我们使用指令也必须在 Angular 模块中进行声明。

***注意：指令不支持命名空间***

    // 这样是不支持的
    <p app:Highlight>This is invalid</p>

@Directive 装饰器的配置属性中指定了该指令的 CSS 属性选择器 `ElementRef`

这里的方括号(`[]`)表示它的属性型选择器。 Angular 会在模板中定位每个拥有名叫 `appHighlight` 属性的元素，并且为这些元素加上本指令的逻辑。

所以，这类指令被称为  `属性选择器`

**也许你会去想，直接访问宿主 DOM 这是怎么做到的呢？**

注意，我们在 import 语句中从 core 库中导入了一个 `ElementRef` 符号。我们可以在指令的构造函数中使用 `ElementRef` 来注入宿主 DOM 的引用，也就是你放置 `ElementRef` 的那个元素。`ElementRef` 通过其 `nativeElement` 赋予了你直接访问宿主 DOM 元素的能力。

`**@HostListener` 装饰器让你订阅某个属性型指令所在的宿主 DOM 元素的事件。**

当然，你也可以通过标准的 JavaScript 方式手动给宿主 DOM 元素附加一个事件监听器，但是这种方式至少有三种问题：
1. 必须正确的书写事件监听器。
2.  当指令被销毁时，必须卸载事件监听器，否则会导致内存泄漏。
3.必须直接和 DOM API 打交道，我们应该避免这样

    @Input('appHighlight') highlightColor: string;

注意这一行代码，我们在 @Input 的参数中把 ’appHighlight‘ 指定为 'highlightColor' 的别名，在指令内部，属性名叫 'highlightColor'，在外部绑定的地方，它叫 ’appHighlight‘