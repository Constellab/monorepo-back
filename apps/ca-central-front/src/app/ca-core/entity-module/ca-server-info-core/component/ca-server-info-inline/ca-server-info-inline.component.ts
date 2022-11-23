import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {CaServerInfo} from '../../../../model/entities/ca-server-info.class';

@Component({
  selector: 'ca-server-info-inline',
  templateUrl: './ca-server-info-inline.component.html',
  styleUrls: ['./ca-server-info-inline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CaServerInfoInlineComponent implements OnInit {

  @Input() serverInfo: CaServerInfo;

  constructor() { }

  ngOnInit(): void {
  }

}
