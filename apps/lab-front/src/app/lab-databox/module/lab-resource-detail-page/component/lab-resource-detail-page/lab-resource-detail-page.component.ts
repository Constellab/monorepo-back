import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {LabResourceDetailState} from '../../state/lab-resource-detail-state.service';

@Component({
  selector: 'lab-resource-detail-page',
  templateUrl: './lab-resource-detail-page.component.html',
  styleUrls: ['./lab-resource-detail-page.component.scss'],
  providers: [LabResourceDetailState]
})
export class LabResourceDetailPageComponent implements OnInit {

  resourceId: string;


  constructor(private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => this.resourceId = params.id
    );
  }
}
