import {Component, Input, OnInit} from '@angular/core';
import {Protocol} from '../../../../model/entities/protocol.entity';
import {RouterService} from '../../../../service/router.service';

/**
 * Detail card to show a protocol with a limited height by default
 */
@Component({
  selector: 'gen-protocol-card-detail',
  templateUrl: './protocol-card-detail.component.html',
  styleUrls: ['./protocol-card-detail.component.scss']
})
export class ProtocolCardDetailComponent implements OnInit {

  @Input() protocol: Protocol;

  @Input() expandProtocol: boolean = false;

  @Input() showDetailButton: boolean = true;

  protocolDetailPage: string;

  constructor() {
  }

  ngOnInit(): void {
    this.protocolDetailPage = RouterService.getProtocolDetailRoute(this.protocol.id);
  }

}
