import {Component, Input, OnInit} from '@angular/core';
import {BioxProtocol} from '../../../../model/entities/biox-processable.entity';

@Component({
  selector: 'gen-biox-protocol-card',
  templateUrl: './biox-protocol-card.component.html',
  styleUrls: ['./biox-protocol-card.component.scss']
})
export class BioxProtocolCardComponent implements OnInit {

  @Input() protocol: BioxProtocol;

  constructor() {
  }

  ngOnInit(): void {
  }

}
