import {Component, OnInit} from '@angular/core';
import {CaProjectObjectDetailState} from '../../../ca-project-object-core/state/ca-project-object-detail.state';
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

  treeOpened$: Observable<boolean>;

  showTreeButton$: Observable<boolean>;


  constructor(private state: CaProjectObjectDetailState) {
  }

  ngOnInit(): void {
    this.state.init();

    this.treeOpened$ = this.state.getTreeDrawerOpened$();
    this.showTreeButton$ = this.state.rootProjectHasChildren$();
  }

}
