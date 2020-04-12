# 第 3 节：HttpXhrBackend

配置好请求之后，最重要的是向服务器发出请求。发请求的方法XmlHttpRequest、Fetch API、JSONP等方法。在 Angular 提供的 HttpClient 模块中，这种服务有两种实现方法——使用 XmlHttpRequest API 实现的HttpXhrBackend 和使用 JSONP 技术实现的 JsonpClientBackend。HttpClient 中默认使用 HttpXhrBackend。

HttpXhrBackend类是基于XMLHttpRequest对象和可观察（Observable）对象实现的。其主要内容如下:

``` typescript
    @Injectable()
    export class HttpXhrBackend implements HttpBackend {
      constructor(private xhrFactory: XhrFactory) {}
    
      /**
       * 参数为request对象.
       * 返回一个发布response events数据流的可观察对象
       */
      handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {
       ...
    })
    }
    }
```

我们看看HttpXhrBackend具体怎么做的。其基于原生XMLHttpRequest对象，监听error，load，progess等事件。根据不同的情况发布不同的HttpEvents。

首先创建一个xhr对象，调用其open方法启动传入的请求，准备发送。

``` typescript
     const xhr = this.xhrFactory.build();
      xhr.open(req.method, req.urlWithParams);
``` 

接着定义了onLoad方法，为load事件的回调函数:

``` typescript
    const onLoad = () => {
            let {headers, status, statusText, url} = partialFromXhr();
    
            let body: any|null = null;
    
            if (status !== 204) { // 204表示用户删除数据成功 
              body = (typeof xhr.response === 'undefined') ? xhr.responseText : xhr.response;
            }
    
            if (status === 0) {
              status = !!body ? 200 : 0;
            }
           let ok = status >= 200 && status < 300;
           // 如果responseType为json，但是返回的类型却是string
           if (req.responseType === 'json' && typeof body === 'string') {
              // 在去掉XSSI前缀之前，保存原来的body
              const originalBody = body;
              body = body.replace(XSSI_PREFIX, '');
              try {
                // 尝试解析json，如果失败则将错误信息传递给用户
                body = body !== '' ? JSON.parse(body) : null;
              } catch (error) {
                // JSON.parse失败则可以合理地假设这可能不是JSON响应。 恢复原始正文（包括任何XSSI前缀）以进行传递
                body = originalBody;
    
                // 若本来就是是一个失败的请求，保留string状态
                // 否则，传递error给用户
                if (ok) {
                  // 尽管status是2xx, 也仍然是错误的
                  ok = false;
                  // 传递内容包括catch到的错误以及无法解析的正文文本。
                  body = { error, text: body } as HttpJsonParseError;
                }
              }
            }
          if (ok) {
              // 若请求成功，事件流传递服务端返回的成功的响应(HttpResponse)
              observer.next(new HttpResponse({
                body,
                headers,
                status,
                statusText,
                url: url || undefined,
              }));
              // 完整的响应体被接受和传递完成时，此request为complete状态
              observer.complete();
            } else {
              // 若请求失败则传递error
              observer.error(new HttpErrorResponse({
                // 此时的error属性为服务器返回的响应体
                error: body,
                headers,
                status,
                statusText,
                url: url || undefined,
              }));
            }
    }
    ...
    xhr.addEventListener('load', onLoad); // load：在接收到完整的响应数据时触发
```

定义onError方法，为error事件的回调函数:

``` typescript
          // 在网络层面有错误时将调用onError回调函数
          // 连接超时, DNS错误, 离线等. 这些都是实际的错误，将触发观察者的error函数
          const onError = (error: ProgressEvent) => {
            const {url} = partialFromXhr();
            const res = new HttpErrorResponse({
              error,
              status: xhr.status || 0,
              statusText: xhr.statusText || 'Unknown Error',
              url: url || undefined,
            });
            observer.error(res);
          };
          // 监听error事件
          xhr.addEventListener('error', onError); // error 在请求发生错误时触发
```

监听progress，并传递下载和上传进度给观察者:
``` typescript
          // 如果req的参数中定义了需要上报progress(reportProgress:boolean)，则监听progress事件
          if (req.reportProgress) {
            xhr.addEventListener('progress', onDownProgress);
    
            // 是否监听上传事件取决于请求中是否有要上传的数据
            if (reqBody !== null && xhr.upload) {
              xhr.upload.addEventListener('progress', onUpProgress);
            }
          }
```

最后，调用send方法，发送请求。另外返回一个unSubscribe函数，用于取消请求处理程序:

``` typescript
          xhr.send(reqBody !);
          observer.next({type: HttpEventType.Sent}); // HttpEventType详细信息见下文response源码
    
          // Observable中的unSubscribe函数（取消请求处理程序)
          return () => {
            // 首先移除所有的事件监听
            xhr.removeEventListener('error', onError);
            xhr.removeEventListener('load', onLoad);
            if (req.reportProgress) {
              xhr.removeEventListener('progress', onDownProgress);
              if (reqBody !== null && xhr.upload) {
                xhr.upload.removeEventListener('progress', onUpProgress);
              }
            }
    
            // 最后调用xhr的abort函数取消请求
            xhr.abort();
          };
        });
      }
```

这里大家应该会好奇，到底有哪几种HttpEvent。HttpEventType定义在源码的response文件:

``` typescript
    export enum HttpEventType {
      Sent, // 该请求已通过网络发送出去
      UploadProgress, // 收到上传进度事件
      ResponseHeader, // 收到响应状态代码和响应头
      DownloadProgress, // 收到下载进度事件
      Response, // 收到包括响应体在内的完整的响应
      User, // 来自拦截器或backend的自定义事件
    }
```
所以，angular的http API并不神秘，基于可观察（Observable）对象和原生XMLHttpRequest对象，其中主要做好对xhr对象的请求和相应的细节处理，本文主要介绍了实现原理，没有详细介绍其中的细节，感兴趣的同学可以自行深入阅读[源码](https://github.com/angular/angular/blob/master/packages/common/http/src/xhr.ts)