import {Component, Input, OnInit} from '@angular/core';
import {CaServerInfo} from '../../../../model/entities/ca-server-info.class';

@Component({
  selector: 'ca-server-info-detail',
  templateUrl: './ca-server-info-detail.component.html',
  styleUrls: ['./ca-server-info-detail.component.scss']
})
export class CaServerInfoDetailComponent implements OnInit {

  @Input() serverInfo: CaServerInfo;

  constructor() {
  }

  ngOnInit(): void {
  }

}
