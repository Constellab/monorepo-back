import {Route, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {ProtocolDetailPageComponent} from './component/protocol-detail-page/protocol-detail-page.component';
import {MyProtocolsPageComponent} from './component/my-protocols-page/my-protocols-page.component';

const routes: Route[] = [
  {path: '', component: MyProtocolsPageComponent},
  {path: ':id', component: ProtocolDetailPageComponent},
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class ProtocolRoutingModule {
}

