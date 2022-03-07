import {NgModule} from '@angular/core';
import {HaPublicBrickPageComponent} from './ha-public-brick-page/ha-public-brick-page.component';
import {HaPublicCoreModule} from '../../ha-public-core/ha-public-core.module';
import {HaCoreModule} from '../../../../ha-core/ha-core.module';
import {CoreModule} from '@angular/flex-layout';
import {HaPublicDocPageModule} from './ha-public-doc-page/ha-public-doc-page.module';
import {HaPublicSidenavComponent} from './ha-public-sidenav/ha-public-sidenav.component';
import {CommonModule} from "@angular/common";
import { HaPublicSidenavCreateFormDialogComponent } from './ha-public-sidenav/ha-public-sidenav-create-form-dialog/ha-public-sidenav-create-form-dialog.component';
import {ReactiveFormsModule} from "@angular/forms";
import {HaMainLoginModule} from '../../../../ha-main/ha-main-login/ha-main-login.module';
import { HaPublicAddVersionDialogComponent } from './ha-public-brick-page/ha-public-add-version-dialog/ha-public-add-version-dialog.component';
import { HaPublicVersionsPageComponent } from './ha-public-versions-page/ha-public-versions-page.component';
import { HaPublicBrickVersionsTableComponent } from './ha-public-versions-page/ha-public-brick-versions-table/ha-public-brick-versions-table.component';
import {MatTableModule} from "@angular/material/table";
import {FlDateModule} from '@monorepo/front-core-lib';

@NgModule({
  declarations: [HaPublicBrickPageComponent, HaPublicSidenavComponent, HaPublicSidenavCreateFormDialogComponent, HaPublicAddVersionDialogComponent, HaPublicVersionsPageComponent, HaPublicBrickVersionsTableComponent],
  imports: [
    HaPublicCoreModule,
    HaCoreModule,
    HaPublicDocPageModule,
    CoreModule,
    CommonModule,
    ReactiveFormsModule,
    HaMainLoginModule,
    MatTableModule,
    FlDateModule
  ]
})
export class HaPublicBrickPageModule {
}
