import {Component, Input, OnInit} from '@angular/core';
import {Study} from '../../../../../core/model/entities/study.class';

/**
 * Show information about a study without the title
 */
@Component({
  selector: 'gen-study-info',
  templateUrl: './study-info.component.html',
  styleUrls: ['./study-info.component.scss']
})
export class StudyInfoComponent implements OnInit {

  @Input() study: Study;

  constructor() {
  }

  ngOnInit(): void {
  }

}
