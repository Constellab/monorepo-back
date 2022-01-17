import {NgModule} from '@angular/core';
import {HaPublicBrickPageComponent} from './ha-public-brick-page/ha-public-brick-page.component';
import {HaPublicCoreModule} from '../../ha-public-core/ha-public-core.module';
import {HaCoreModule} from '../../../../ha-core/ha-core.module';
import {CoreModule} from '@angular/flex-layout';
import {HaPublicDocPageModule} from './ha-public-doc-page/ha-public-doc-page.module';
import {HaPublicSidenavComponent} from './ha-public-sidenav/ha-public-sidenav.component';
import {CommonModule} from "@angular/common";

@NgModule({
  declarations: [HaPublicBrickPageComponent, HaPublicSidenavComponent],
    imports: [
        HaPublicCoreModule,
        HaCoreModule,
        HaPublicDocPageModule,
        CoreModule,
        CommonModule,
    ]
})
export class HaPublicBrickPageModule {
}
