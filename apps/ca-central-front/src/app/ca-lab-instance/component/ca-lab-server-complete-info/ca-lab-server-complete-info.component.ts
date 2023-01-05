import {Component, Input, OnInit} from '@angular/core';
import {CaServerCompleteInfo} from '../../../ca-core/model/entities/lab/ca-lab-server.class';

@Component({
  selector: 'ca-lab-server-complete-info',
  templateUrl: './ca-lab-server-complete-info.component.html',
  styleUrls: ['./ca-lab-server-complete-info.component.scss']
})
export class CaLabServerCompleteInfoComponent implements OnInit {

  @Input() serverInfo: CaServerCompleteInfo;

  constructor() {
  }

  ngOnInit(): void {
  }

}
