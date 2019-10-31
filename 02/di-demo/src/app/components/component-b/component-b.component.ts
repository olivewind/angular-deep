import { Component, OnInit, forwardRef, Injector } from '@angular/core';
import { ComponentAComponent } from '../component-a/component-a.component';

@Component({
  selector: 'app-component-b',
  templateUrl: './component-b.component.html',
  styleUrls: ['./component-b.component.less'],
})
export class ComponentBComponent implements OnInit {

  constructor(
    private injector: Injector
  ) { }

  ngOnInit() {
  }

  hello() {
    console.warn('hello from child');
  }

  triggerFatherFn() {
    this.injector.get(ComponentAComponent).hello();
  }

}
