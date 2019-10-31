import { Component, ViewChild } from '@angular/core';
import { ComponentBComponent } from '../component-b/component-b.component';

@Component({
  selector: 'app-component-a',
  templateUrl: './component-a.component.html',
  styleUrls: ['./component-a.component.less']
})
export class ComponentAComponent {
  @ViewChild(ComponentBComponent)
  private componentBComponent: ComponentBComponent;

  constructor(
  ) { }

  triggerChildFn() {
    this.componentBComponent.hello();
  }

  hello() {
    console.warn('hello from a');
  }

}
