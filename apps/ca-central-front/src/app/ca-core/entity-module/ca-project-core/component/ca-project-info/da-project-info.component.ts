import {Component, Input, OnInit} from '@angular/core';
import {CaProject} from '../../../../model/entities/ca-project.class';

/**
 * Simple component to display information about a project
 */
@Component({
  selector: 'ca-project-info',
  templateUrl: './da-project-info.component.html',
  styleUrls: ['./da-project-info.component.scss']
})
export class DaProjectInfoComponent implements OnInit {

  @Input() project: CaProject;

  constructor() { }

  ngOnInit(): void {
  }

}
