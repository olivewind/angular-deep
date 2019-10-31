import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

// platformBrowserDynamic().bootstrapModule(AppModule)
//   .catch(err => console.error(err));


// const logMeta = (target: any, propertyKey: string) => {
//   // 获取成员类型 -> Function
//   console.log(Reflect.getMetadata('design:type', target, propertyKey));
//   // 获取成员参数类型 -> [String]
//   console.log(Reflect.getMetadata('design:paramtypes', target, propertyKey));
//   // 获取成员返回类型 -> String
//   console.log(Reflect.getMetadata('design:returntype', target, propertyKey));
// };


// class SayHello {
//   @logMeta
//   hello(name: string): string {
//     return `hello, ${name}`;
//   }
// }
