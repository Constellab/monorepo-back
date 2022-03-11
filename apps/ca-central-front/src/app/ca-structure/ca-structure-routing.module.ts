import {Route, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {
  CaOrganizationPageComponent
} from './ca-organization-page/component/ca-organization-page/ca-organization-page.component';

const routes: Route[] = [
  {path: 'organization/:id', component: CaOrganizationPageComponent}
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class CaStructureRoutingModule {
}

