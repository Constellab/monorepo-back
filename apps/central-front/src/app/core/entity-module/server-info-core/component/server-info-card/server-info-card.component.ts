import {Component, Input, OnInit} from '@angular/core';
import {ServerInfo} from '../../../../model/entities/server-info.class';

@Component({
  selector: 'gen-server-info-card',
  templateUrl: './server-info-card.component.html',
  styleUrls: ['./server-info-card.component.scss']
})
export class ServerInfoCardComponent implements OnInit {

  @Input() serverInfo: ServerInfo;

  constructor() {
  }

  ngOnInit(): void {
  }

}
