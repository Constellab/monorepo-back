import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'gen-biox-processable-port',
  templateUrl: './biox-processable-port.component.html',
  styleUrls: ['./biox-processable-port.component.scss']
})
export class BioxProcessablePortComponent implements OnInit {

  @Input() name: string;

  @Input() types: string[];

  constructor() {
  }

  ngOnInit(): void {
  }

}
