import {AfterViewInit, Component, Host, OnInit, Optional} from '@angular/core';
import {BioxProject} from '../../../../model/entities/biox-project.class';
import {BioxProjectService} from '../../../../entity-service/biox-project.service';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';
import {MatSelect} from '@angular/material/select';

/**
 * Component to place under a mat-select to show the list of projects
 */
@Component({
  selector: 'gen-biox-project-select-options',
  templateUrl: './biox-project-select-options.component.html',
  styleUrls: ['./biox-project-select-options.component.scss']
})
export class BioxProjectSelectOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit {

  projects: BioxProject[];

  constructor(@Host() @Optional() public select: MatSelect,
              private projectService: BioxProjectService) {
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
