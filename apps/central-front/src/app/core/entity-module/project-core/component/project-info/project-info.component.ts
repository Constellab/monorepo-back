import {Component, Input, OnInit} from '@angular/core';
import {Project} from '../../../../model/entities/project.class';

/**
 * Simple component to display information about a project
 */
@Component({
  selector: 'gen-project-info',
  templateUrl: './project-info.component.html',
  styleUrls: ['./project-info.component.scss']
})
export class ProjectInfoComponent implements OnInit {

  @Input() project: Project;

  constructor() { }

  ngOnInit(): void {
  }

}
