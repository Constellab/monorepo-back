import {Component, Input, OnInit} from '@angular/core';
import {Project} from '../../../../model/entities/project.class';

/**
 * Card for a project
 */
@Component({
  selector: 'gen-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss']
})
export class ProjectCardComponent implements OnInit {

  @Input() project: Project;

  projectDetailRoute: string;

  constructor() {
  }

  ngOnInit(): void {
  }

}
