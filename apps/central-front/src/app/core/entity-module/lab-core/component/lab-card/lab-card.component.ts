import {Component, Input, OnInit} from '@angular/core';
import {Lab} from '../../../../model/entities/lab.class';

/**
 * Card to display a {@link Lab}
 */
@Component({
  selector: 'gen-lab-card',
  templateUrl: './lab-card.component.html',
  styleUrls: ['./lab-card.component.scss']
})
export class LabCardComponent implements OnInit {

  @Input() lab: Lab;

  constructor() {
  }

  ngOnInit(): void {
  }

}
