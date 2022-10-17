import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Observable, switchMap} from 'rxjs';
import {CaProjectService} from '../../../../../ca-core/service-api/ca-project.service';
import {CaProject} from '../../../../../ca-core/model/entities/ca-project.class';
import {FlArrayObs, FlEntityArrayObs, FlTableColumn} from '@monorepo/front-core-lib';

@Component({
  selector: 'ca-project-children',
  templateUrl: './ca-project-children.component.html',
  styleUrls: ['./ca-project-children.component.scss']
})
export class CaProjectChildrenComponent implements OnInit, OnDestroy {

  @Input() projectId$: Observable<string>;

  children$: FlArrayObs<CaProject>;

  columns: FlTableColumn<CaProject>[] = ['title', 'status', 'leader'];

  constructor(private projectService: CaProjectService) {
  }

  ngOnInit(): void {
    this.children$ = new FlEntityArrayObs(
      this.projectId$.pipe(
        switchMap(id => this.projectService.getChildren(id))
      )
    );
  }

  ngOnDestroy(): void {
    this.children$?.disconnect();
  }



}
