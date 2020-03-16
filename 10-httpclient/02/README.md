# 第 2 节：HttpRequest

HttpRequest类实现http请求的配置。发送一个请求时可以配置请求方法、请求头、请求体、查询参数等。

### 2.1 基本使用
1. 发送带特定请求头的请求:

``` typescript
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'my-auth-token'
      })
    };
    const req=new HttpRequest('get','assets/app-data.json',httpOptions);
```

2. 设置带查询参数的请求:

``` typescript
    const httpOptions={
    params:new HttpParams().set('name', term)
    };
    const req=new HttpRequest('get','assets/app-data.json',httpOptions);
```

### 2.2 源码解析

[源码](https://github.com/angular/angular/blob/master/packages/common/http/src/request.ts)

重点在于HttpRequest类的构造函数，一共四个参数，前两个参数分别是请求方法、请求路径，第三个参数为请求体或该请求相关的配置参数。下图源码可见判断依据为:

``` typescript
     export class HttpRequest<T>{
    ...
    constructor(method: string, 
    readonly url: string, 
    third?: T|{headers?: HttpHeaders, // 可见T为请求body的类型
    reportProgress?: boolean,
    params?: HttpParams,
    responseType?: 'arraybuffer'|'blob'|'json'|'text',
    withCredentials?: boolean,}|null,
    fourth?: {headers?: HttpHeaders,
    reportProgress?: boolean,
    params?: HttpParams,
    responseType?: 'arraybuffer'|'blob'|'json'|'text',
    withCredentials?: boolean,}){
    ...
    // 如果是可能有请求体的请求，或者具有第四个参数，则第三个参数为请求体
    if (mightHaveBody(this.method) || !!fourth) {
          this.body = (third !== undefined) ? third as T : null;
          options = fourth;
        } else {
          // 否则第三个参数为相关的配置
          options = third as HttpRequestInit;
        }
    }
    }
```

mightHaveBody的定义:

``` typescript
    // 根据请求方法判断哪些请求可能有请求体
    function mightHaveBody(method: string): boolean {
      switch (method) {
        case 'DELETE':
        case 'GET':
        case 'HEAD':
        case 'OPTIONS':
        case 'JSONP':
          return false;
        default:
          return true;
      }
    }
```

### 2.3 req.clone

上一章我们了解到拦截器可以拦截并配置请求，虽然拦截器有能力改变请求，但 HttpRequest的实例的属性却是只读（readonly）的， 因此它们基本上是不可变的。要想修改请求，就要先克隆它，并修改这个克隆体，然后再把这个克隆体传给 next.handle()。

1. 使用示例:

``` typescript
    const secureReq = req.clone({
      url: req.url.replace('http://', 'https://')
    });
    return next.handle(secureReq);

    const authReq = req.clone({
          headers: req.headers.set('Authorization', authToken)
        });
```

2. clone的源码实现:

clone方法为HttpRequest类中的一个方法，传入一个update对象(包括了一系列构建HttpRequest所需的参数)，返回一个新的HttpRequest实例。源码如下:

``` typescript
      clone(update: {
    headers?: HttpHeaders,
    reportProgress?: boolean,
     params?: HttpParams,
    responseType?: 'arraybuffer'|'blob'|'json'|'text',
    withCredentials?: boolean,
    body?: any|null,
    method?: string,
    url?: string, 
    setHeaders?: {[name: string]: string | string[]},
    setParams?: {[param: string]: string};  } = {}): HttpRequest<any> {    
    const method = update.method || this.method;    
    const url = update.url || this.url;    
    const responseType = update.responseType || this.responseType;  
    const body = (update.body !== undefined) ? update.body : this.body;   
    const withCredentials = (update.withCredentials !== undefined) ? update.withCredentials : this.withCredentials; 
    const reportProgress = (update.reportProgress !== undefined) ? update.reportProgress : this.reportProgress; 
    let headers = update.headers || this.headers;   
    let params = update.params || this.params;
    // 如果存在`setHeaders`或`setParams`，则可以更快捷的设置标题和参数
    if (update.setHeaders !== undefined) {     
      headers = Object.keys(update.setHeaders)
    .reduce((headers, name) => headers.set(name, update.setHeaders ![name]), headers);
        } 
    if (update.setParams) {        
     params = Object.keys(update.setParams)
    .reduce((params, param) => params.set(param, update.setParams ![param]), params);    }  
    return new HttpRequest( method, url, body, {params, headers, reportProgress, responseType, withCredentials,}); }
```

clone方法的原理主要是，使用传入的新的参数替换之前的请求中的参数。其中需要注意的是headers和params的设置。

官方文档中介绍的常规的覆盖headers的写法如下:

``` typescript
    const authReq = req.clone({
          headers: req.headers.set('Authorization', authToken)
        });
```
快捷的写法如下：

``` typescript
    const authReq = req.clone({ setHeaders: { Authorization: authToken } });
```

通过上述源码，不难看出这种快捷的方式是怎么实现的。