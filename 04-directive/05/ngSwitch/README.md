# NgSwitch 指令

### NgSwitch 的基本用法

NgSwitch 其实是一个很有意思的指令，它本身是一个属性型指令，而与之配合的 NgSwitchCase 和 NgSwitchDefault 缺是结构型指令。所以我们经常在代码中可以看到 [ngSwitch] 和 *ngSwitchCase 和 *ngSwitchDefault 的原因。

    // 日常写法
    <div [ngSwitch]="hero?.emotion">
      <app-happy-hero    *ngSwitchCase="'happy'"    [hero]="hero"></app-happy-hero>
      <app-sad-hero      *ngSwitchCase="'sad'"      [hero]="hero"></app-sad-hero>
      <app-confused-hero *ngSwitchCase="'confused'" [hero]="hero"></app-confused-hero>
      <app-unknown-hero  *ngSwitchDefault           [hero]="hero"></app-unknown-hero>
    </div>
    
    // 解开语法糖
    <div [ngSwitch]="hero?.emotion">
      <ng-template [ngSwitchCase]="'happy'">
        <app-happy-hero [hero]="hero"></app-happy-hero>
      </ng-template>
      <ng-template [ngSwitchCase]="'sad'">
        <app-sad-hero [hero]="hero"></app-sad-hero>
      </ng-template>
      <ng-template [ngSwitchCase]="'confused'">
        <app-confused-hero [hero]="hero"></app-confused-hero>
      </ng-template >
      <ng-template ngSwitchDefault>
        <app-unknown-hero [hero]="hero"></app-unknown-hero>
      </ng-template>
    </div>


### NgSwitch 的实现原理

来让我们看一下，NgSwitch 内部到底做了哪些事情？

    // angular 相关源码
    
    /** @internal */
      _addCase(): number { return this._caseCount++; }
    
      /** @internal */
      _addDefault(view: SwitchView) {
        if (!this._defaultViews) {
          this._defaultViews = [];
        }
        this._defaultViews.push(view);
      }
    
      /** @internal */
      _matchCase(value: any): boolean {
        const matched = value == this._ngSwitch;
        this._lastCasesMatched = this._lastCasesMatched || matched;
        this._lastCaseCheckIndex++;
        if (this._lastCaseCheckIndex === this._caseCount) {
          this._updateDefaultCases(!this._lastCasesMatched);
          this._lastCaseCheckIndex = 0;
          this._lastCasesMatched = false;
        }
        return matched;
      }
    
      private _updateDefaultCases(useDefault: boolean) {
        if (this._defaultViews && useDefault !== this._defaultUsed) {
          this._defaultUsed = useDefault;
          for (let i = 0; i < this._defaultViews.length; i++) {
            const defaultView = this._defaultViews[i];
            defaultView.enforceState(useDefault);
          }
        }
      }

宿主元素中的 ngSwitch 指令会在每次 [ngSwitch] 这个输入属性发生改变时进行判断：

  1. 如果没有ngSwtichCase 的情况下updateDefaultCases() 直接渲染 ngSwitchDefault 指令中的内容
  2. 否则的话，通过  ngSwtichCase 指令提供的匹配表达式会去调用  matchCase() 来渲染每一个匹配到的视图，注意，这里与严格相等(===)的 JavaScript 不同，在 matchCase() 中使用的匹配规则是宽松相等(==)
  3. 如果没有匹配到的视图，再次调用 updateDefaultCases() 来渲染 ngSwitchDefault 中的内容。 
  4. 存在于 NgSwitch 指令中，但是不在 NgSwitchCase 或 ngSwitchDefault 中的语句都会在原来的位置中进行渲染。