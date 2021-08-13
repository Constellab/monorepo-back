import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BioxProtocolType} from '../../../../model/entities/processable-type/biox-protocol-type.entity';

@Component({
  selector: 'gen-biox-protocol-type-list',
  templateUrl: './biox-protocol-type-list.component.html',
  styleUrls: ['./biox-protocol-type-list.component.scss']
})
export class BioxProtocolTypeListComponent implements OnInit {

  @Input() protocolTypes: BioxProtocolType[];

  @Output() protocolTypeClick: EventEmitter<BioxProtocolType> = new EventEmitter();
  @Output() protocolTypeDblClick: EventEmitter<BioxProtocolType> = new EventEmitter();

  constructor() {
  }

  ngOnInit(): void {
  }

  protocolClick(protocol: BioxProtocolType): void {
    this.protocolTypeClick.emit(protocol);

  }

  protocolDblClick(protocol: BioxProtocolType): void {
    this.protocolTypeDblClick.emit(protocol);
  }
}
