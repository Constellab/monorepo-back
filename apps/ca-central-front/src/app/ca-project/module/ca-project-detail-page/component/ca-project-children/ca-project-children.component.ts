import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {CaProject} from '../../../../../ca-core/model/entities/ca-project.class';
import {CaProjectDetailState} from '../../state/ca-project-detail.state';

@Component({
  selector: 'ca-project-children',
  templateUrl: './ca-project-children.component.html',
  styleUrls: ['./ca-project-children.component.scss']
})
export class CaProjectChildrenComponent implements OnInit, OnDestroy {


  children$: Observable<CaProject[]>;


  constructor(private state: CaProjectDetailState) {
  }

  ngOnInit(): void {
    this.children$ = this.state.getChildren$().connect();
  }

  ngOnDestroy(): void {
  }


}
