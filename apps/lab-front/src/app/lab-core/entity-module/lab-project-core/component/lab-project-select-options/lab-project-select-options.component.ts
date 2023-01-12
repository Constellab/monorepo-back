import {AfterViewInit, Component, Host, OnInit, Optional} from '@angular/core';
import {LabProject} from '../../../../model/entities/lab-project.class';
import {LabProjectService} from '../../../../entity-service/lab-project.service';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';
import {MatLegacySelect as MatSelect} from '@angular/material/legacy-select';

/**
 * Component to place under a mat-select to show the list of projects
 */
@Component({
  selector: 'lab-project-select-options',
  templateUrl: './lab-project-select-options.component.html',
  styleUrls: ['./lab-project-select-options.component.scss']
})
export class LabProjectSelectOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit {

  projects: LabProject[];

  constructor(@Host() @Optional() public select: MatSelect,
              private projectService: LabProjectService) {
    super(select);
  }

  ngOnInit(): void {
    this.projectService.getProjects().subscribe(
      projects => this.projects = projects
    );

    this.overrideCompareWithOnIds(this.select);
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }
}
