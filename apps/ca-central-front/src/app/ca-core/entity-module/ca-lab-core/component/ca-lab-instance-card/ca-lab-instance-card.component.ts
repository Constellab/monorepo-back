import {Component, Input, OnInit} from '@angular/core';
import {CaLabInstance} from '../../../../model/entities/lab/ca-lab-instance.class';

/**
 * Card to display a {@link CaLabInstance}
 */
@Component({
  selector: 'ca-lab-instance-card',
  templateUrl: './ca-lab-instance-card.component.html',
  styleUrls: ['./ca-lab-instance-card.component.scss']
})
export class CaLabInstanceCardComponent implements OnInit {

  @Input() labInstance: CaLabInstance;

  @Input() mode: 'small' | 'big' = 'small';

  constructor() {
  }

  ngOnInit(): void {

  }


}
