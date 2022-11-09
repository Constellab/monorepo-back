import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {CaProjectObjectRef} from '../../../../../ca-core/model/entities/ca-project.class';
import {FlQueryParamHandler, FlRouterHelper} from '@monorepo/front-core-lib';
import {map} from 'rxjs/operators';
import {CaProjectObjectDetailState} from '../../state/ca-project-object-detail.state';
import {Observable} from 'rxjs';

/**
 * Detail page for the project objects (project, experiment, report).
 * It contains the breadcrumb and the tree panel that can be open on the left.
 * In center in contains a router outlet to render object page
 */
@Component({
  selector: 'ca-project-object-detail-page',
  templateUrl: './ca-project-object-detail-page.component.html',
  styleUrls: ['./ca-project-object-detail-page.component.scss'],
  providers: [CaProjectObjectDetailState]
})
export class CaProjectObjectDetailPageComponent implements OnInit {

  treeOpened = false;

  showTree$: Observable<boolean>;

  private queryParamHandler: FlQueryParamHandler<{ showTree?: boolean }>;


  constructor(private state: CaProjectObjectDetailState,
              private route: ActivatedRoute,
              private router: Router) {
    this.queryParamHandler = new FlQueryParamHandler(router, route);
  }

  ngOnInit(): void {
    const projectObjectRef$ = FlRouterHelper.listenToChildrenParams(this.router, this.route)
      .pipe(
        map(params => this.getProjectObjectRef(params))
      );

    this.state.init(projectObjectRef$);

    // init tree open
    this.queryParamHandler.getFirstQueryParams().subscribe(
      params => {
        if (params.showTree) {
          this.treeOpened = true;
        }
      }
    );

    this.showTree$ = this.state.getProjectTree$().pipe(
      map(ancestors => ancestors.children.length > 0)
    );

    // if there is no hierarchy, force the tree to be closed
    this.showTree$.subscribe(
      showTree => {
        if (!showTree) {
          this.setTreeOpened(false);
        }
      });
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
    this.setTreeOpened(!this.treeOpened);
  }

  private setTreeOpened(treeOpened: boolean): void {
    this.treeOpened = treeOpened;
    if (this.treeOpened) {
      this.queryParamHandler.mergeQueryParams({showTree: true});
    } else {
      this.queryParamHandler.mergeQueryParams({showTree: null});
    }
  }

}
