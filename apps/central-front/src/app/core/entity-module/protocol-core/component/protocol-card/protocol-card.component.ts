import {Component, Input, OnInit} from '@angular/core';
import {Protocol} from '../../../../model/entities/protocol.entity';

/**
 * Simple card to show protocol name
 */
@Component({
  selector: 'gen-protocol-card',
  templateUrl: './protocol-card.component.html',
  styleUrls: ['./protocol-card.component.scss']
})
export class ProtocolCardComponent implements OnInit {

  @Input() protocol: Protocol;

  constructor() {
  }

  ngOnInit(): void {
  }

}
