import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServiceBService {


  constructor() {
    console.warn('ServiceBService 实例化');
  }

  hello() {
    console.warn('hello ServiceAService');
  }
}
