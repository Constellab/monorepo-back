import {Component, OnInit} from '@angular/core';
import {ProjectService} from '../../../../service/project.service';
import {ActivatedRoute} from '@angular/router';
import {Project} from '../../../../../core/model/entities/project.class';

/**
 * Page for a project detail
 */
@Component({
  selector: 'gen-project-detail-page',
  templateUrl: './project-detail-page.component.html',
  styleUrls: ['./project-detail-page.component.scss']
})
export class ProjectDetailPageComponent implements OnInit {

  project: Project;

  isLoading: boolean = false;

  constructor(private projectService: ProjectService,
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

  private getProjectSuccess(project: Project): void {
    this.project = project;
    this.isLoading = false;
  }

  onProjectUpdate(project: Project): void {
    this.project = project;
  }

}
