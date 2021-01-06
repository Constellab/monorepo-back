import {Component, Input, OnInit} from '@angular/core';
import {Study} from '../../../../../core/model/entities/study.class';

/**
 * Card to display a study with the possibility to update the study
 */
@Component({
  selector: 'gen-study-card',
  templateUrl: './study-card.component.html',
  styleUrls: ['./study-card.component.scss']
})
export class StudyCardComponent implements OnInit {

  @Input() study: Study;

  constructor() {
  }

  ngOnInit(): void {
  }

}
