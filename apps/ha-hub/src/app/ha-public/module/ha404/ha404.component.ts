import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'ha-ha404',
  templateUrl: './ha404.component.html',
  styleUrls: ['./ha404.component.scss']
})
export class Ha404Component implements OnInit {

  @Input()
  errorText: string = 'error_page_not_found'

  constructor() { }

  ngOnInit(): void {
  }

}
