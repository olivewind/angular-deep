# 第 3 节：路由守卫

在商业化应用中，路由守卫几乎是必不可少的，它主要可以用在两个场景上

### 3.1 检查是否可以进入

通常使用在检查登陆状态，用户角色的时候

#### **3.1.1 `CanActivate`**

先定义一个检查是否登陆的守卫

``` typescript
import { Injectable }    from '@angular/core';
import { CanDeactivate } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // 检查是否已经登陆
    if (this.authService.isLoggedIn) return true;
    this.router.navigateByUrl(`/login?from=${state.url}`);
    return false;
  }
}

export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // 检查是否已经登陆
    if (this.authService.isLoggedIn) return true;
    this.router.navigateByUrl(`/login?from=${state.url}`);
    return false;
  }
  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    return this.canActivate(route, state);
  }
}
```

使用守卫

``` typescript
const routes: Routes = [
  {
    path: 'secret',
    canActivate: [AuthGuard],
    component: SecretComponent,
  }
];
```

#### **3.1.2 `CanActivateChild`**

CanActivateChild 和 CanActivate 的唯一区别就是前者是用于守卫子路由的

``` typescript
import { Injectable }    from '@angular/core';
import { CanActivateChild } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class CanActivateChildGuard implements CanActivateChild {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // 检查是否已经登陆
    if (this.authService.isLoggedIn) return true;
    this.router.navigateByUrl(`/login?from=${state.url}`);
    return false;
  }
}
```

使用守卫，注意这里如果这里使用 `loadChildren` 来懒加载子路由的话，那么在守卫通过之前模块代码将不会被加载。

``` typescript
const routes: Routes = [
  {
    path: 'secret',
    canActivateChild: [CanActivateChildGuard],
    loadChildren: () => import('./secret.module').then(m => m.SecretModule),
  }
];
```

### 3.2 检查是否可以退出

通常使用在路由切出时提示用户保存表单

**3.2.1 `CanDeactivate`**

编写一个退出守卫

``` typescript
import { Injectable }           from '@angular/core';
import { Observable }           from 'rxjs';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot }  from '@angular/router';
import { EditFormComponent } from './pages/edit-form/edit-form.component';

@Injectable({
  providedIn: 'root',
})
export class CanDeactivateGuard implements CanDeactivate<EditFormComponent> {
  canDeactivate(
    editFormComponent: EditFormComponent,
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    if (!editFormComponent.hasChanged) {
      return true;
    }
    return of(window.confirm('表单数据还未提交，确定要退出?'));
  }
}
```

使用守卫

``` typescript
const routes: Routes = [
  {
    path: 'edit-form',
    component: EditFormComponent
    canActivateChild: [CanDeactivateGuard]
  }
];
```

上述三个方法都接受三种返回类型同步的 `Boolean`，异步的 `Promise<Boolen>` 和 `Observable<Boolean>`