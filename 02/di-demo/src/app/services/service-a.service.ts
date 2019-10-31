import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServiceAService {

  constructor() {
    console.warn('ServiceAService 实例化');
  }

  hello() {
    console.warn('hello ServiceAService');
  }
}
