import {NgModule} from '@angular/core';
import {DaPublicBrickPageRoutingModule} from './da-public-brick-page-routing.module';
import {DaPublicBrickPageComponent} from './da-public-brick-page/da-public-brick-page.component';
import {DaPublicCoreModule} from '../../da-public-core/da-public-core.module';
import {DaCoreModule} from '../../../../da-core/da-core.module';
import {CoreModule} from '@angular/flex-layout';
import {DaPublicDocPageModule} from './da-public-doc-page/da-public-doc-page.module';
import {DaPublicSidenavComponent} from './da-public-sidenav/da-public-sidenav.component';

@NgModule({
  declarations: [DaPublicBrickPageComponent, DaPublicSidenavComponent],
  imports: [
    DaPublicBrickPageRoutingModule,
    DaPublicCoreModule,
    DaCoreModule,
    DaPublicDocPageModule,
    CoreModule,
  ]
})
export class DaPublicBrickPageModule {
}
