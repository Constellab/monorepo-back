import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BioxProtocolSpec} from '../../../../model/entities/processable-spec/biox-protocol-spec.entity';

@Component({
  selector: 'gen-biox-protocol-type-list',
  templateUrl: './biox-protocol-type-list.component.html',
  styleUrls: ['./biox-protocol-type-list.component.scss']
})
export class BioxProtocolTypeListComponent implements OnInit {

  @Input() protocolTypes: BioxProtocolSpec[];

  @Output() protocolTypeClick: EventEmitter<BioxProtocolSpec> = new EventEmitter();
  @Output() protocolTypeDblClick: EventEmitter<BioxProtocolSpec> = new EventEmitter();

  constructor() {
  }

  ngOnInit(): void {
    console.log('init');
  }

  protocolClick(protocol: BioxProtocolSpec): void {
    this.protocolTypeClick.emit(protocol);

  }

  protocolDblClick(protocol: BioxProtocolSpec): void {
    this.protocolTypeDblClick.emit(protocol);
  }
}
