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
import { HaPublicAddVersionDialogComponent } from './ha-public-versions-page/ha-public-add-version-dialog/ha-public-add-version-dialog.component';
import { HaPublicVersionsPageComponent } from './ha-public-versions-page/ha-public-versions-page.component';
import { HaPublicBrickVersionsTableComponent } from './ha-public-versions-page/ha-public-brick-versions-table/ha-public-brick-versions-table.component';
import {MatTableModule} from "@angular/material/table";
import {FlDateModule} from '@monorepo/front-core-lib';
import { HaPublicBrickDescriptionPageComponent } from './ha-public-brick-description-page/ha-public-brick-description-page.component';
import {MatCardModule} from '@angular/material/card';

@NgModule({
  declarations: [HaPublicBrickPageComponent, HaPublicSidenavComponent, HaPublicSidenavCreateFormDialogComponent, HaPublicAddVersionDialogComponent, HaPublicVersionsPageComponent, HaPublicBrickVersionsTableComponent, HaPublicBrickDescriptionPageComponent],
  imports: [
    HaPublicCoreModule,
    HaCoreModule,
    HaPublicDocPageModule,
    CoreModule,
    CommonModule,
    ReactiveFormsModule,
    HaMainLoginModule,
    MatTableModule,
    FlDateModule,
    MatCardModule
  ]
})
export class HaPublicBrickPageModule {
}
