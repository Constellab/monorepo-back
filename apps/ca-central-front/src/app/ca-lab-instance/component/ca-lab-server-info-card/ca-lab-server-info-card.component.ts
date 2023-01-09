import {Component, Input, OnInit} from '@angular/core';
import {CaLabInstance} from '../../../ca-core/model/entities/lab/ca-lab-instance.class';

@Component({
  selector: 'ca-lab-server-info-card',
  templateUrl: './ca-lab-server-info-card.component.html',
  styleUrls: ['./ca-lab-server-info-card.component.scss']
})
export class CaLabServerInfoCardComponent implements OnInit {

  @Input() labInstance: CaLabInstance;

  constructor() {
  }

  ngOnInit(): void {
  }

}
