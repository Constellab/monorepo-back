import {Component, OnInit} from '@angular/core';
import {CaProjectService} from '../../../../../ca-core/service-api/ca-project.service';
import {ActivatedRoute} from '@angular/router';
import {CaProject} from '../../../../../ca-core/model/entities/ca-project.class';

/**
 * Page for a project detail
 */
@Component({
  selector: 'ca-project-detail-page',
  templateUrl: './ca-project-detail-page.component.html',
  styleUrls: ['./ca-project-detail-page.component.scss']
})
export class CaProjectDetailPageComponent implements OnInit {

  project: CaProject;

  isLoading: boolean = false;

  constructor(private projectService: CaProjectService,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => this.getProject(params.id)
    );
  }

  private getProject(id: string): void {
    this.isLoading = true;
    this.projectService.getById(id).subscribe(
      project => this.getProjectSuccess(project),
      () => this.isLoading = false
    );
  }

  private getProjectSuccess(project: CaProject): void {
    this.project = project;
    this.isLoading = false;
  }

  onProjectUpdate(project: CaProject): void {
    this.project = project;
  }

}
