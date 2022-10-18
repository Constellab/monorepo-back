import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {CaProjectObjectRef} from '../../../../../ca-core/model/entities/ca-project.class';
import {FlQueryParamHandler, FlRouterHelper} from '@monorepo/front-core-lib';
import {map} from 'rxjs/operators';

/**
 * Detail page for the project objects (project, experiment, report).
 * It contains the breadcrumb and the tree panel that can be open on the left.
 * In center in contains a router outlet to render object page
 */
@Component({
  selector: 'ca-project-object-detail-page',
  templateUrl: './ca-project-object-detail-page.component.html',
  styleUrls: ['./ca-project-object-detail-page.component.scss']
})
export class CaProjectObjectDetailPageComponent implements OnInit {

  treeOpened = false;

  projectObjectRef$: Observable<CaProjectObjectRef>;

  private queryParamHandler: FlQueryParamHandler<{ showTree?: boolean }>;


  constructor(private route: ActivatedRoute,
              private router: Router) {
    this.queryParamHandler = new FlQueryParamHandler(router, route);
  }

  ngOnInit(): void {
    this.projectObjectRef$ = FlRouterHelper.listenToChildrenParams(this.router, this.route)
      .pipe(
        map(params => this.getProjectObjectRef(params))
      );

    // init tree open
    this.queryParamHandler.getFirstQueryParams().subscribe(
      params => {
        if (params.showTree) {
          this.treeOpened = true;
        }
      }
    );
  }

  private getProjectObjectRef(params: Params): CaProjectObjectRef {
    if (params.experimentId) {
      return {
        type: 'experiment',
        id: params.experimentId
      };
    } else if (params.reportId) {
      return {
        type: 'report',
        id: params.reportId
      };
    } else {
      return {
        type: 'project',
        id: params.projectId
      };
    }
  }

  toggleTree(): void {
    this.treeOpened = !this.treeOpened;

    if (this.treeOpened) {
      this.queryParamHandler.mergeQueryParams({showTree: true});
    } else {
      this.queryParamHandler.mergeQueryParams({showTree: null});
    }
  }

}
