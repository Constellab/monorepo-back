import {Component, Input, OnInit} from '@angular/core';
import {CaProjectAncestorTreeDTO, CaProjectAncestorType} from '../../../../../ca-core/model/entities/ca-project.class';
import {CaProjectService} from '../../../../../ca-core/service-api/ca-project.service';
import {Observable, switchMap} from 'rxjs';
import {map} from 'rxjs/operators';
import {CaRouterService} from '../../../../../ca-core/service/ca-router.service';
import {FlTranslateService} from '@monorepo/front-core-lib';

interface BreadcrumbLink {
  title: string;
  url: string;
}

/**
 * Breadcrumb for project, report and experiments
 * It gets the hierarchy from the api
 */
@Component({
  selector: 'ca-project-breadcrumb',
  templateUrl: './ca-project-breadcrumb.component.html',
  styleUrls: ['./ca-project-breadcrumb.component.scss']
})
export class CaProjectBreadcrumbComponent implements OnInit {

  @Input() objectType: CaProjectAncestorType;

  @Input() objectId$: Observable<string>;

  links$: Observable<BreadcrumbLink[]>;

  constructor(private projectService: CaProjectService,
              private translateService: FlTranslateService) {
  }

  ngOnInit(): void {
    this.links$ = this.objectId$.pipe(
      switchMap(objectId => this.projectService.getObjectProjectAncestors(this.objectType, objectId)),
      map(ancestors => this.ancestorsToLinks(ancestors))
    );
  }

  private ancestorsToLinks(ancestors: CaProjectAncestorTreeDTO[]): BreadcrumbLink[] {
    const links: BreadcrumbLink[] = [];

    for (const ancestor of ancestors) {
      links.unshift({
        title: ancestor.title,
        url: this.getAncestorLink(ancestor)
      });
    }

    // add the dashboard link
    links.unshift({
      title: this.translateService.translate('dashboard'),
      url: CaRouterService.getDashboardRoute()
    });


    return links;
  }

  private getAncestorLink(ancestor: CaProjectAncestorTreeDTO): string {
    switch (ancestor.type) {
      case 'project':
        return CaRouterService.getProjectDetailRoute(ancestor.id);
      case 'experiment':
        return CaRouterService.getExperimentDetailRoute(ancestor.id);
      case 'report':
        return CaRouterService.getReportDetailRoute(ancestor.id);
    }
  }

}
