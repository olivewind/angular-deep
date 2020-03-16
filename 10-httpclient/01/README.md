# 第 1 节：基本使用

大多数前端应用都需要通过http协议与后端进行通信。@angular/common/http 中的 HttpClient 类为 Angular 应用程序提供了一个简化的 API 来实现 HTTP 客户端功能。它基于浏览器提供的 XMLHttpRequest 接口和可观察对象。 HttpClient 的优点包括：强类型的请求和响应对象、拦截器支持，以及更好的、基于可观察（Observable）对象的 API 以及流式错误处理机制。

### 1.1 发起请求

1. get请求，从服务器获取数据

``` typescript
configUrl = 'assets/app-data.json';

getConfig() {
  return this.http.get(this.configUrl);
}
```

2. post请求

``` typescript
// 添加hero
addHero (hero: Hero): Observable<Hero> {
  return this.http.post<Hero>(this.heroesUrl, hero, httpOptions)
    .pipe(
      catchError(this.handleError('addHero', hero))
    );
}
// 第二个参数hero为请求体，第三个参数httpOptions为请求相关的配置参数(包括请求头，查询参数，responseType等)。
// catchError为rxjs操作符，可优雅地处理 observable 序列中的错误
```

3. put请求

``` typescript
    // 修改hero
    updateHero (hero: Hero): Observable<Hero> {
      return this.http.put<Hero>(this.heroesUrl, hero, httpOptions)
        .pipe(
          catchError(this.handleError('updateHero', hero))
        );
    }
```

 4. delete请求

``` typescript
    // 删除对应id的hero
    deleteHero (id: number): Observable<{}> {
      const url = `${this.heroesUrl}/${id}`; 
      return this.http.delete(url, httpOptions)
        .pipe(
          catchError(this.handleError('deleteHero'))
        );
    }
```

5. 请求带类型的响应

``` typescript
    export interface Config {
      heroesUrl: string;
      textfile: string;
    }
    getConfig() {
      // 限制响应体的类型
      return this.http.get<Config>(this.configUrl);
    }
```

### 1.2 错误处理

某些情况下，发起的http请求会出错。不管是服务器错误还是客户端错误，HttpClient 都会返回一个错误（error）的响应。通过在subscribe()中传入第二个回调函数可以获取错误对象。

``` typescript
    showConfig() {
      this.configService.getConfig()
        .subscribe(
          (data: Config) => this.config = { ...data }, // 请求成功
          error => this.error = error // 请求出错
        );
    }
```

请求出错可能的类型有两种:
一种是请求到达了服务器，服务器错误，返回了一个失败的状态码(404，500等)，此时HttpClient返回一个错误响应体。

另一种是在客户端出错(比如在 RxJS 操作符 (operator) 中抛出的异常或网络错误)，此时HttpClient就会抛出一个 Error 类型的异常。

我们可以在某个服务中设计一个错误处理器，对不同的错误类型做处理。

``` typescript
    private handleError(error: HttpErrorResponse) {
      if (error.error instanceof ErrorEvent) {
        // 客户端错误
        console.error('An error occurred:', error.error.message);
      } else {
        // 服务器错误
        console.error(
          `Backend returned code ${error.status}, ` +
          `body was: ${error.error}`);
      }
      // 返回一个错误的可观察对象
      return throwError(
        'Something bad happened; please try again later.');
    };
```

通过rxjs管道，由catchError捕获错误，并将错误传给错误处理器:

``` typescript
    getConfig() {
      return this.http.get<Config>(this.configUrl)
        .pipe(
          catchError(this.handleError)
        );
    }
```


### 1.3 设置拦截器

HTTP 拦截机制是 @angular/common/http 中的主要特性之一。 使用这种拦截机制，你可以声明一些拦截器，用它们监视和转换从应用发送到服务器的 HTTP 请求。 拦截器还可以用监视和转换从服务器返回到本应用的那些响应。 多个拦截器会构成一个“请求/响应处理器”的双向链表。

1. 要实现拦截器，就要实现一个实现了 HttpInterceptor 接口中的 intercept() 方法的类:

``` typescript
    import { Injectable } from '@angular/core';
    import {
      HttpEvent, HttpInterceptor, HttpHandler, HttpRequest
    } from '@angular/common/http';
    
    import { Observable } from 'rxjs';
    
    /** Pass untouched request through to the next request handler. */
    @Injectable()
    export class NoopInterceptor implements HttpInterceptor {
    
      intercept(req: HttpRequest<any>, next: HttpHandler):
        Observable<HttpEvent<any>> {
        // 拦截请求，添加请求头
        const modified = req.clone({setHeaders: {'Header-1': 'header1'}});
        return next.handle(modified).pipe(
       // 拦截并转换响应
          mergeMap((event: any) => {
            if (event instanceof HttpResponseBase) return this.handleData(event);
            return of(event);
          }),
          catchError((err: HttpErrorResponse) => this.handleData(err)),
        );;
      }
    }
```

拦截器可以实现设置默认请求头、记日志、缓存某些请求和响应等操作。具体可以参考官方文档：[https://angular.cn/guide/http](https://angular.cn/guide/http)

2. 提供拦截器

由于拦截器是 HttpClient 服务的（可选）依赖，所以你必须在提供 HttpClient 的同一个（或其各级父注入器）注入器中提供这些拦截器。 那些在 DI 创建完 HttpClient 之后再提供的拦截器将会被忽略。

``` typescript
    { provide: HTTP_INTERCEPTORS, useClass: NoopInterceptor, multi: true },
```
multi: true 选项告诉 Angular HTTP_INTERCEPTORS 是一个多重提供商的令牌，表示它会注入一个多值的数组。可以把所有拦截器都收集起来，一起提供给 httpInterceptorProviders 数组：

``` typescript
    import { HTTP_INTERCEPTORS } from '@angular/common/http';
    
    import { NoopInterceptor } from './noop-interceptor';
    
    export const httpInterceptorProviders = [
      { provide: HTTP_INTERCEPTORS, useClass: NoopInterceptor1, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: NoopInterceptor2, multi: true },
    ];
```

然后导入它，并把它加到 AppModule 的 providers 数组中：

``` typescript
    providers: [
      httpInterceptorProviders
    ],
```
