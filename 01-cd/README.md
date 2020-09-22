### 1. 如何实现变更的检测(数据变化 -> 视图更新)

#### React
``` javascript
this.setState({ })
```

#### Vue2
``` javascript
Object.defineproperty
```

#### Vue3

``` javascript
Proxy
```

#### Angularjs

``` javascript
$setTimeout, $setInterval…. $digest
```

#### Angular
``` javascript
zone.js
```

### 2. Angular 相比 Angularjs 如何做到性能提升？

单向数据流 +组件树 -> 性能提升

>移除了双向绑定，减少了不必要的变更检测

### 3.Zone.js(ngZone)

#### 问题：如何知道我们应用中 `setTimeout`/`console.log` 被调用了?
暴力美学，直接代理这些方法
https://github.com/angular/angular/tree/master/packages/zone.js/


#### 问题：我能去掉 zone 么？在 Angular 里是必选的么？
```javascript
// 5.0 之后的版本可以手动去掉
import { platformBrowser } from '@angular/platform-browser'

platformBrowser().bootstrapModuleFactory(AppModuleNgFactory, { ngZone: 'noop' })
```
#### 问题：我能不去掉 `zone` 么，但是脱离 `zone` 的管控么？

```javascript
this.ngZone.runOutsideAngular(() => { 
   // do something
});
```

> 在某些场景下，这个可以作为性能优化的一种手段，比如事件监听，HostListener，对 Dom(Canvas) 的直接操作
> 使用 runOutsideAngular 提升应用性能。[例子](https://medium.com/@krzysztof.grzybek89/how-runoutsideangular-might-reduce-change-detection-calls-in-your-app-6b4dab6e374d)

### 4.变更检测策略(ChangeDetectionStrategy)


```typescript
// Immutable
@component({
  selector: 'xxx’,
  templateUrl: 'xxx’,
  changeDetection: ChangeDetectionStrategy.OnPush
})

```

### 5.干预变更检测(ChangeDetectionRef)

#### 1.markForCheck
``` javascript
// 忽略使用了 onPush 对 cd 的影响
this.changeDetectorRef.markForCheck();
```
![image](https://user-images.githubusercontent.com/17901361/69481578-82537680-0e4d-11ea-838b-8d32d542a328.png)


#### 2.detectChanges

``` javascript
// 当前组件
 this.changeDetectorRef.detectChanges();
// 整个应用
 this.applicationRef.tick();
```
![image](https://user-images.githubusercontent.com/17901361/69481581-85e6fd80-0e4d-11ea-8841-3605c7762ea4.png)

#### 3.checkNoChanges
![](./images/03.png)
![image](https://user-images.githubusercontent.com/17901361/69481582-88e1ee00-0e4d-11ea-92b5-c2a2e99bdb89.png)

#### 4.ChangeDetectionRef.detach( ) 和 ChangeDetectionRef.reattach( )
![](./images/04.png)
![image](https://user-images.githubusercontent.com/17901361/69481583-8b444800-0e4d-11ea-86d5-b17e630e533b.png)

### 参考资料

[《Angular Change Detection Explained》](https://blog.thoughtram.io/angular/2016/02/22/angular-2-change-detection-explained.html)

[《Change Detection Reinvented Victor Savkin》](https://www.youtube.com/watch?v=jvKGQSFQf10)

[《These 5 articles will make you an Angular Change Detection expert》](https://blog.angularindepth.com/these-5-articles-will-make-you-an-angular-change-detection-expert-ed530d28930)