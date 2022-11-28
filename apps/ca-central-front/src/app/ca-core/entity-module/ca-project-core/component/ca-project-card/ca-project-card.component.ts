import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {CaProject} from '../../../../model/entities/ca-project.class';

/**
 * Card for a project
 */
@Component({
  selector: 'ca-project-card',
  templateUrl: './ca-project-card.component.html',
  styleUrls: ['./ca-project-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CaProjectCardComponent implements OnInit {

  @Input() project: CaProject;

  @Input() hideGoToProjectButton: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
  }

}
