import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'ca-dashboard-module-page',
  templateUrl: './ca-dashboard-module-page.component.html',
  styleUrls: ['./ca-dashboard-module-page.component.scss']
})
export class CaDashboardModulePageComponent implements OnInit {

  breadcrumbPart: string[] = ['dashboard', 'project', 'experiment', 'report'];

  constructor() {
  }

  ngOnInit(): void {
  }

}
