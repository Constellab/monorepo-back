import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {LabResourceDetailState} from '../../state/lab-resource-detail-state.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'lab-resource-detail-page',
  templateUrl: './lab-resource-detail-page.component.html',
  styleUrls: ['./lab-resource-detail-page.component.scss'],
  providers: [LabResourceDetailState]
})
export class LabResourceDetailPageComponent implements OnInit {

  resourceId$: Observable<string>;


  constructor(private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.resourceId$ = this.route.params.pipe(
      map(params => params.id)
    );
  }
}
