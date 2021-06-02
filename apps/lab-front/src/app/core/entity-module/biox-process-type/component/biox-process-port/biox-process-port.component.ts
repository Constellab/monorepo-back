import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'gen-biox-process-port',
  templateUrl: './biox-process-port.component.html',
  styleUrls: ['./biox-process-port.component.scss']
})
export class BioxProcessPortComponent implements OnInit {

  @Input() name: string;

  @Input() types: string[];

  constructor() {
  }

  ngOnInit(): void {
  }

}
