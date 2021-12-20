import {Component, Input, OnInit} from '@angular/core';
import {CaServerInfo} from '../../../../model/entities/ca-server-info.class';

@Component({
  selector: 'ca-server-info-card',
  templateUrl: './ca-server-info-card.component.html',
  styleUrls: ['./ca-server-info-card.component.scss']
})
export class CaServerInfoCardComponent implements OnInit {

  @Input() serverInfo: CaServerInfo;

  constructor() {
  }

  ngOnInit(): void {
  }

}
