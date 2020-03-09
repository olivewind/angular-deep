# NgForOf 指令

### NgForOf 的基本用法

ngForOf 指令通常被简写成 *ngFor。让我们来看一个例子：

    <li *ngFor="let item of items; index as i; trackBy: trackByFn">...</li>

Angular 实际上在编译的时候回自动会把这种形式扩展为使用 <ng-template> 元素上的 ngForOf 的完整形式，而 <ng-template> 元素的内容是保存简写指令的 <li> 元素。NgForOf 指令会为可迭代对象中的每一个条目实例化一个模板，实例化时的上下文环境来自其外部环境，它以当前正在迭代的条目作为循环变量。

    // 这里是扩展后的完整形式
    <ng-template ngFor let-item [ngForOf]="items" let-i="index" [ngForTrackBy]="trackByFn">
      <li>...</li>
    </ng-template>

- let 关键字声明一个模板输入变量，你会在模板中引用它。
- 微语法解析器接收 of  和 trackby，把它们首字母大写(of → Of, trackby → TrackBy)， 并且给它们加上指令的属性名(ngFor)前缀，最终生成的名字是 ngForOf 和 ngForTrackBy，这两个是 NgFor 的输入属性。
- NgFor 指令在列表上循环，每个循环都会设置和重置自己的上下文对象属性，这些属性包括 index 以及一个特殊的属性名 $implicit(隐式变量)。
- let-i 变量通过 let i = index 定义的，Angular 把它们设置为上下文对象中的 index属性的当前值
- 这里并没有定义 item 的上下文属性，它的来源是隐式的，Angular 把它们设置为上下文对象中的 $implicit 属性的值，它是由 ngFor 当前迭代中的 items 初始化的。

### NgForOf 的实现原理

**变更的传导机制**

当迭代器的内容变化时，NgForOf 会对 DOM 做出相应的修改：

- 当新增条目时，就会往 DOM 中添加一个模板实例
- 当移除条目时，其对应的模板实例也会被从 DOM 中移除
- 当条目集被重新排序时，他们对应的模板实例也会在 DOM 中重新排序

Angular 使用对象标识符（对象引用）来跟踪得带器中的添加和删除操作，并把它们同步到 DOM中，这对于动画和状态的控件（如用来接收用户输入的<input>元素）具有非常重要的意义，添加的行为可以带着动画效果进来，删除的行为也可以带着动画离开，而未变化的则会保留那些尚未保存的状态，比如用户输入。

即使数据没有变化，迭代器中的元素标识符也可能会发生变化，比如，如果迭代器处理的目标是通过 RPC 从服务器取来的，而 RPC 又重新执行了一次，那么即使数据没有变化，第二次的响应体还是会生成一些具有不同标识符的对象，Angular 将会清除整个 DOM，并重建它（就仿佛把所有老的元素删除，并插入所有新元素）。这种操作非常昂贵，应该尽力避免

要想要自定义默认的跟踪算法，NgForOf 支持 trackBy 选项，trackBy 接受一个带有两个参数（index 和 item）函数，如果给出了 trackBy， Angular 就会使用该函数的返回值来追踪变化。

    // angular 相关源码
    /**
      * Applies the changes when needed.
     */
    ngDoCheck(): void {
        if (this._ngForOfDirty) {
          this._ngForOfDirty = false;
          // React on ngForOf changes only once all inputs have been initialized
          const value = this._ngForOf;
          if (!this._differ && value) {
            try {
              this._differ = this._differs.find(value).create(this.ngForTrackBy);
            } catch {
              throw new Error(
                  `Cannot find a differ supporting object '${value}' of type '${getTypeName(value)}'. NgFor only supports binding to Iterables such as Arrays.`);
            }
          }
        }
        if (this._differ) {
          const changes = this._differ.diff(this._ngForOf);
          if (changes) this._applyChanges(changes);
        }
      }
    ....
    private _applyChanges(changes: IterableChanges<T>) {
        const insertTuples: RecordViewTuple<T, U>[] = [];
        changes.forEachOperation(
            (item: IterableChangeRecord<any>, adjustedPreviousIndex: number | null,
             currentIndex: number | null) => {
              if (item.previousIndex == null) {
                // NgForOf is never "null" or "undefined" here because the differ detected
                // that a new item needs to be inserted from the iterable. This implies that
                // there is an iterable value for "_ngForOf".
                const view = this._viewContainer.createEmbeddedView(
                    this._template, new NgForOfContext<T, U>(null !, this._ngForOf !, -1, -1),
                    currentIndex === null ? undefined : currentIndex);
                const tuple = new RecordViewTuple<T, U>(item, view);
                insertTuples.push(tuple);
              } else if (currentIndex == null) {
                this._viewContainer.remove(
                    adjustedPreviousIndex === null ? undefined : adjustedPreviousIndex);
              } else if (adjustedPreviousIndex !== null) {
                const view = this._viewContainer.get(adjustedPreviousIndex) !;
                this._viewContainer.move(view, currentIndex);
                const tuple = new RecordViewTuple(item, <EmbeddedViewRef<NgForOfContext<T, U>>>view);
                insertTuples.push(tuple);
              }
            });
    
        for (let i = 0; i < insertTuples.length; i++) {
          this._perViewChange(insertTuples[i].view, insertTuples[i].record);
        }
    
        for (let i = 0, ilen = this._viewContainer.length; i < ilen; i++) {
          const viewRef = <EmbeddedViewRef<NgForOfContext<T, U>>>this._viewContainer.get(i);
          viewRef.context.index = i;
          viewRef.context.count = ilen;
          viewRef.context.ngForOf = this._ngForOf !;
        }
    
        changes.forEachIdentityChange((record: any) => {
          const viewRef =
              <EmbeddedViewRef<NgForOfContext<T, U>>>this._viewContainer.get(record.currentIndex);
          viewRef.context.$implicit = record.item;
        });
      }

#### 局部变量

在 NgForOf 指令中，有局部变量的概念。NgForOf 提供可以别名为局部变量的导出值.

    <li *ngFor="let user of userObservable | async as users; index as i; first as isFirst">
       {{i}}/{{users.length}}. {{user}} <span *ngIf="isFirst">default</span>
    </li>

NgForOf 导出了一系列值，可以指定别名作为局部变量使用:

- $implicit: T：迭代目标（绑定到ngForOf）中每个条目的值。
- ngForOf: NgIterable<T>：迭代表达式的值。当表达式不局限于访问某个属性时，这会非常有用，比如在使用 async 管道时（userStreams | async）。
- index: number：可迭代对象中当前条目的索引。
- first: boolean：如果当前条目是可迭代对象中的第一个条目则为 true。
- last: boolean：如果当前条目是可迭代对象中的最后一个条目则为 true。
- even: boolean：如果当前条目在可迭代对象中的索引号为偶数则为 true。
- odd: boolean：如果当前条目在可迭代对象中的索引号为奇数则为 true。