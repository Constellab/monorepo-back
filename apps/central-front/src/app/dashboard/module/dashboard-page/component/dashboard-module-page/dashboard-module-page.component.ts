import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'gen-dashboard-module-page',
  templateUrl: './dashboard-module-page.component.html',
  styleUrls: ['./dashboard-module-page.component.scss']
})
export class DashboardModulePageComponent implements OnInit {

  breadcrumbPart: string[] = ['dashboard', 'project', 'study', 'experiment'];

  constructor() {
  }

  ngOnInit(): void {
  }

}
