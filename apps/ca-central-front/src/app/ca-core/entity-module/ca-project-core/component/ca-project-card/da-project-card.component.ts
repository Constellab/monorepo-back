import {Component, Input, OnInit} from '@angular/core';
import {CaProject} from '../../../../model/entities/ca-project.class';

/**
 * Card for a project
 */
@Component({
  selector: 'ca-project-card',
  templateUrl: './da-project-card.component.html',
  styleUrls: ['./da-project-card.component.scss']
})
export class DaProjectCardComponent implements OnInit {

  @Input() project: CaProject;

  projectDetailRoute: string;

  constructor() {
  }

  ngOnInit(): void {
  }

}
