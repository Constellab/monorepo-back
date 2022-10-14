import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'ca-dashboard-breadcrumb',
  templateUrl: './ca-dashboard-breadcrumb.component.html',
  styleUrls: ['./ca-dashboard-breadcrumb.component.scss']
})
export class CaDashboardBreadcrumbComponent implements OnInit {

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => console.log(params)
    );
    this.route.firstChild.params.subscribe(
      params => console.log('child', params)
    );
  }

}
