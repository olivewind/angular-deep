# NgIf 指令

### NgIf 的基本用法

如果我们想要在DOM中添加或者移除某个元素，可以通过吧 NgIf 指令添加到宿主元素的方式

    <div *ngIf="isActive">hello</div>

你也可以通过 类绑定 和 样式绑定 来控制它的显示或隐藏

    <!-- isSpecial is true -->
    <div [class.hidden]="!isSpecial">Show with class</div>
    <div [class.hidden]="isSpecial">Hide with class</div>
    
    <!-- HeroDetail is in the DOM but hidden -->
    <app-hero-detail [class.hidden]="isSpecial"></app-hero-detail>
    
    <div [style.display]="isSpecial ? 'block' : 'none'">Show with style</div>
    <div [style.display]="isSpecial ? 'none'  : 'block'">Hide with style</div>

这两种方式都可以实现我们的需求，但是 隐藏子树 和用 NgIf 排除子树是截然不同的。当隐藏子树时，它仍然留在 DOM 中，子树中的组件及其状态仍然保留着，即使对于不可见属性，Angualr也会继续检查变更，子树可能占用相当可观的内存和运算资源。当 NgIf 为 false 时，Angular 从 DOM 中物理移除了这个子树，它销毁了子树组件及其状态，也潜在的释放了可观的资源，可以让用户拥有更好的性能体验。

 NgIf 指令通常会用来防范空指针错误，而显示/ 隐藏的方式是无法防范的，当一个表达式尝试访问空值的属性时，Angular 会抛出一个异常。这可能会让我们的页面崩溃。所以，除非有着强烈的理由来保留他们，否则我们更倾向于移除那些用户看不到的 DOM 元素，并且使用 NgIf 这样的结构型指令来回收用不到的资源。

### NgIf 的实现原理

我们先来看一个例子：

    @Component({
      selector: 'ng-if-then-else',
      template: `
        <button (click)="show = !show">{{show ? 'hide' : 'show'}}</button>
        <button (click)="switchPrimary()">Switch Primary</button>
        show = {{show}}
        <br>
        <div *ngIf="show; then thenBlock; else elseBlock">this is ignored</div>
        <ng-template #primaryBlock>Primary text to show</ng-template>
        <ng-template #secondaryBlock>Secondary text to show</ng-template>
        <ng-template #elseBlock>Alternate text while primary text is hidden</ng-template>
    `
    })
    export class NgIfThenElse implements OnInit {
      thenBlock: TemplateRef<any>|null = null;
      show: boolean = true;
     
      @ViewChild('primaryBlock', {static: true})
      primaryBlock: TemplateRef<any>|null = null;
      @ViewChild('secondaryBlock', {static: true})
      secondaryBlock: TemplateRef<any>|null = null;
     
      switchPrimary() {
        this.thenBlock = this.thenBlock === this.primaryBlock ? this.secondaryBlock : this.primaryBlock;
      }
     
      ngOnInit() { this.thenBlock = this.primaryBlock; }
    }
在上面的代码中，不仅在条件为 false 的时候我们可以正确的展示 elseBlock中的内容，在条件为true时，视图内容可以在运行时根据条件被动态的替换掉，这是怎么做到的呢？

在 Angular 中关于 NgIf 指令的实现中，有着这样的逻辑，首先给当前显示的视图内容赋值为 ngIf 中的内容，当我们不提供 [ngIfThen] 的时候，我们会使用 [ngIf] 提供的模板，否则的话，则使用 [ngIfThen] 中的内容。当判断条件发生更改时，我们会将当前的视图清空掉，进行正确的赋值操作。
相关源码：

    // angular 中 NgIf 的核心代码实现
    private _updateView() {
        if (this._context.$implicit) {
          if (!this._thenViewRef) {
            this._viewContainer.clear();
            this._elseViewRef = null;
            if (this._thenTemplateRef) {
              this._thenViewRef =
                  this._viewContainer.createEmbeddedView(this._thenTemplateRef, this._context);
            }
          }
        } else {
          if (!this._elseViewRef) {
            this._viewContainer.clear();
            this._thenViewRef = null;
            if (this._elseTemplateRef) {
              this._elseViewRef =
                  this._viewContainer.createEmbeddedView(this._elseTemplateRef, this._context);
            }
          }
        }
      }