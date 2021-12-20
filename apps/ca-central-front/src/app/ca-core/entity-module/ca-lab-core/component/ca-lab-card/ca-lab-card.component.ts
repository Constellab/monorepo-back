import {Component, Input, OnInit} from '@angular/core';
import {CaLab} from '../../../../model/entities/ca-lab.class';

/**
 * Card to display a {@link CaLab}
 */
@Component({
  selector: 'ca-lab-card',
  templateUrl: './ca-lab-card.component.html',
  styleUrls: ['./ca-lab-card.component.scss']
})
export class CaLabCardComponent implements OnInit {

  @Input() lab: CaLab;

  constructor() {
  }

  ngOnInit(): void {
  }

}
