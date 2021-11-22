import {Component, Input, OnInit} from '@angular/core';
import {BioxIOSpec} from '../../../../model/entities/biox-io.entity';

@Component({
  selector: 'gen-biox-process-port',
  templateUrl: './biox-process-port.component.html',
  styleUrls: ['./biox-process-port.component.scss']
})
export class BioxProcessPortComponent implements OnInit {

  @Input() name: string;

  @Input() specs: BioxIOSpec;

  constructor() {
  }

  ngOnInit(): void {
  }

}
