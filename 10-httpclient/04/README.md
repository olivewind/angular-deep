# 第 4 节：拦截器

拦截器是HttpClient的一个主要功能，可以监听并转换请求以及响应。

### 4.1 拦截器基本原理

拦截器的基本用法我们在第一章已经讲到过:

``` typescript
    @Injectable()
    export class I1 implements HttpInterceptor {
        intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
            const modified = req.clone({setHeaders: {'Header-1': 'header1'}});
            return next.handle(modified);
        }
    }
```

主要是实现一个HttpInterceptor中定义的intercept接口:

``` typescript
    // HttpInterceptor接口内描述了intercept方法
    export interface HttpInterceptor {
      /**
       * 识别并处理给定的HTTP请求
       * @param req :传出的请求对象
       * @param next :拦截器链中的下一个拦截器,或者是backend
       * 如果已没有其他的拦截器在拦截器链中，返回发布HttpEvent流的可观察对象。
       */
      intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>;
    }
```

在intercept中实现拦截的内容。intercept方法有两个参数：请求(req)和下一个拦截器(next)。

大多数拦截器拦截都会在传入时检查请求，然后把（可能被修改过的）请求转发给 next 对象的 handle() 方法，而 next 对象实现了 HttpHandler 接口。

``` typescript
    export abstract class HttpHandler {
      abstract handle(req: HttpRequest<any>): Observable<HttpEvent<any>>;
    }
```

像 intercept() 一样，handle() 方法也会把 HTTP 请求转换成 HttpEvents 组成的 Observable ，它最终包含的是来自服务器的响应。intercept() 函数可以检查这个可观察对象，并在把它返回给调用者之前修改它。

next 对象表示拦截器链表中的下一个拦截器。 这个链表中的最后一个 next 对象就是 HttpClient 的后端处理器，即上一章讲过的HttpXhrBackend，它会把请求发给服务器，并接收服务器的响应。

``` typescript
    export class HttpClient {
        constructor(private handler: HttpHandler) {}
    
        request(...): Observable<any> {
            ...
            const events$: Observable<HttpEvent<any>> = 
                of(req).pipe(concatMap((req: HttpRequest<any>) => this.handler.handle(req)));
            ...
        }
    }
```

默认情况下，全局 HTTP handler 是 HttpXhrBackend。它被注册在注入器中的 HttpBackend 令牌下。

``` typescript
    @NgModule({
        providers: [
            HttpXhrBackend,
            { provide: HttpBackend, useExisting: HttpXhrBackend } 
        ]
    })
    export class HttpClientModule {}
```

上一章分析HttpXhrBackend的源码时，HttpXhrBackend中最主要的方法就是实现的HttpHandler接口中定义的handle方法。在handel方法中实现对请求的发送以及对响应的监听。

``` typescript
    export abstract class HttpHandler {
        abstract handle(req: HttpRequest<any>): Observable<HttpEvent<any>>;
    }
    
    export abstract class HttpBackend implements HttpHandler {
        abstract handle(req: HttpRequest<any>): Observable<HttpEvent<any>>;
    }
    
    export class HttpXhrBackend implements HttpBackend {
        handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {}
    }
```

### 4.2 拦截器链的封装

实际上在官方文档中，我们可以了解到，我们是可以定义并使用多个拦截器的，next就是拦截器链中的下一个拦截器。那么上一个拦截器是如何获取下一个拦截器next的呢？

我们来看一下HttpInterceptorHandler这个接口：

``` typescript
    export class HttpInterceptorHandler implements HttpHandler {
      constructor(private next: HttpHandler, private interceptor: HttpInterceptor) {}
    
      handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {
        return this.interceptor.intercept(req, this.next);
      }
    }
    
    /**
     * 定义了HTTP_INTERCEPTORS这个InjectionToken，返回HttpInterceptor数组
     */
    export const HTTP_INTERCEPTORS = new InjectionToken<HttpInterceptor[]>('HTTP_INTERCEPTORS');
```

HttpInterceptorHandler将保存链中下一个处理程序的引用，并将其与请求一起传递给下一个拦截器。

比如，我们定义了两个拦截器：

``` typescript
    @Injectable()
    export class I1 implements HttpInterceptor {
        intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
            const modified = req.clone({setHeaders: {'Header-1': 'header1'}});
            return next.handle(modified);
        }
    }
    
    @Injectable()
    export class I2 implements HttpInterceptor {
        intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
            const modified = req.clone({setHeaders: {'Header-2': 'header2'}});
            return next.handle(modified);
        }
    }
```

要调用这两个拦截器，我们可以利用HttpInterceptorHandler在当前拦截器中保留下一个拦截器的引用：

``` typescript
    export class AppComponent {
        response: Observable<any>;
        constructor(private backend: HttpXhrBackend) {}
    
        request() {
            const req = new HttpRequest('GET', 'this.heroesUrl');
            const i1Handler = new HttpInterceptorHandler(this.backend, new I1());
            const i2Handler = new HttpInterceptorHandler(i1Handler, new I2());
            this.response = i2Handler.handle(req);
        }
    }
```

但是手动的对每一个拦截器做这样的封装很麻烦，实际上Angular HttpClient中已经实现了HttpInterceptingHandler服务类，来自动对每一个拦截器进行封装，实现将多个拦截器转换为一条拦截器链：

``` typescript
    @Injectable()
    export class HttpInterceptingHandler implements HttpHandler {
      private chain: HttpHandler|null = null;
    
      constructor(private backend: HttpBackend, private injector: Injector) {}
    
      handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {
        if (this.chain === null) {
          const interceptors = this.injector.get(HTTP_INTERCEPTORS, []);
          this.chain = interceptors.reduceRight(
              (next, interceptor) => new HttpInterceptorHandler(next, interceptor), this.backend);
        }
        return this.chain.handle(req);
      }
    }
```

HttpInterceptingHandler是一个可注入的HttpHandler，它将多个拦截器应用于请求，然后再将其传递给给定的HttpBackend。这个链表中的最后一个 next 对象就是 HttpClient 的后端处理器，它会把请求发给服务器，并接收服务器的响应。

在HttpClientModule中，以HttpHandler为令牌注入了HttpInterceptingHandler，所以调用HttpHandler服务，就可以调用整个拦截器链。

``` typescript
@NgModule({
  /**
   * Optional configuration for XSRF protection.
   */
  imports: [
    HttpClientXsrfModule.withOptions({
      cookieName: 'XSRF-TOKEN',
      headerName: 'X-XSRF-TOKEN',
    }),
  ],
  /**
   * Configures the [dependency injector](guide/glossary#injector) where it is imported
   * with supporting services for HTTP communications.
   */
  providers: [
    HttpClient,
    {provide: HttpHandler, useClass: HttpInterceptingHandler},
    HttpXhrBackend,
    {provide: HttpBackend, useExisting: HttpXhrBackend},
    BrowserXhr,
    {provide: XhrFactory, useExisting: BrowserXhr},
  ],
})
export class HttpClientModule {
}
``` 
