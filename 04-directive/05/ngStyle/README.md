# NgStyle 指令

### NgStyle 的基本用法

与 NgClass 相似，NgStyle 也接收 行内声明 和 Typescript 属性/方法 作为输入内容。不过它只支持 对象（ key 为需要处理的 style 名称，值为对应的属性值） 作为输入类型。 接收对象的 key 允许带有单位来简写语句。

    <div [ngStyle]="{'max-width.px': 16}">...</div>
    
    // 等同于
    <div [ngStyle]="{'max-width': ’16px‘}">...</div>

### NgStyle 的实现原理

NgStyle 与 NgClass 的实现类似

    // angular 相关源码
    import {ElementRef, Injectable, KeyValueChanges, KeyValueDiffer, KeyValueDiffers, Renderer2} from '@angular/core';
    
    import {StylingDiffer, StylingDifferOptions} from './styling_differ';
    ...
    constructor(
          private _ngEl: ElementRef, private _differs: KeyValueDiffers, private *_renderer: Renderer2) {}
    ...
    private _applyChanges(changes: KeyValueChanges<string, string|number>): void {
        changes.forEachRemovedItem((record) => this._setStyle(record.key, null));
        changes.forEachAddedItem((record) => this._setStyle(record.key, record.currentValue));
        changes.forEachChangedItem((record) => this._setStyle(record.key, record.currentValue));
      }
    
      private _setStyle(nameAndUnit: string, value: string|number|null|undefined): void {
        const [name, unit] = nameAndUnit.split('.');
        value = value != null && unit ? `${value}${unit}` : value;
    
        if (value != null) {
          this._renderer.setStyle(this._ngEl.nativeElement, name, value as string);
        } else {
          this._renderer.removeStyle(this._ngEl.nativeElement, name);
        }
      }

当 Angular 触发 _setStyle() 函数时，Renderer2 会触发 nativeElement 上面的 setStyle() 和 removeStyle() 方法，与 NgClass 不同的是， addClass() 并不会覆盖前面的CSS class，仅仅是做添加操作，而 setStyle() 会重置掉当前的 CSS style。
