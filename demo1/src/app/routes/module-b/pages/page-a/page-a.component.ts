import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-module-b-page-a',
  templateUrl: './page-a.component.html',
})
export class ModuleBPageAComponent implements OnInit {
  constructor(
    private route: ActivatedRoute
  ) {
  }

  ngOnInit() {
    console.warn('id', this.route.snapshot.params.id);
  }

}
