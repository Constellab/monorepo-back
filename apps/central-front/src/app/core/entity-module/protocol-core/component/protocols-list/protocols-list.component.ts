import {Component, Input, OnInit} from '@angular/core';
import {Protocol} from '../../../../model/entities/protocol.entity';
import {RouterService} from '../../../../service/router.service';

/**
 * list of protocols
 */
@Component({
  selector: 'gen-protocols-list',
  templateUrl: './protocols-list.component.html',
  styleUrls: ['./protocols-list.component.scss']
})
export class ProtocolsListComponent implements OnInit {

  @Input() protocols: Protocol[];


  constructor() {
  }

  ngOnInit(): void {
  }


  getProtocolRoute(protocol: Protocol): string {
    return RouterService.getProtocolDetailRoute(protocol.id);
  }


}
