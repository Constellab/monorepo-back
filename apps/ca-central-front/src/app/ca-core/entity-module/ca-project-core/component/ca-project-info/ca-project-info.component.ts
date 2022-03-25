import {Component, Input, OnInit} from '@angular/core';
import {CaProject} from '../../../../model/entities/ca-project.class';

/**
 * Simple component to display information about a project
 */
@Component({
  selector: 'ca-project-info',
  templateUrl: './ca-project-info.component.html',
  styleUrls: ['./ca-project-info.component.scss']
})
export class CaProjectInfoComponent implements OnInit {

  @Input() project: CaProject;

  constructor() { }

  ngOnInit(): void {
  }

}
