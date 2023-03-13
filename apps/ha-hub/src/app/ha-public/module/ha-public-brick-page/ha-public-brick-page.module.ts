import {NgModule} from '@angular/core';
import {HaPublicBrickPageComponent} from './ha-public-brick-page/ha-public-brick-page.component';
import {HaPublicCoreModule} from '../ha-public-core/ha-public-core.module';
import {HaCoreModule} from '../../../ha-core/ha-core.module';
import {CoreModule} from '@angular/flex-layout';
import {HaPublicSidenavComponent} from './ha-public-sidenav/ha-public-sidenav.component';
import {CommonModule} from "@angular/common";
import {
  HaPublicSidenavCreateFormDialogComponent
} from './ha-public-sidenav-create-form-dialog/ha-public-sidenav-create-form-dialog.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HaPublicAddVersionDialogComponent} from './ha-public-add-version-dialog/ha-public-add-version-dialog.component';
import {HaPublicVersionsComponent} from './ha-public-versions/ha-public-versions.component';
import {
  HaPublicBrickVersionsTableComponent
} from './ha-public-brick-versions-table/ha-public-brick-versions-table.component';
import {MatLegacyTableModule as MatTableModule} from "@angular/material/legacy-table";
import {FlDateModule, FlInputFileModule, FlKeyValueModule} from '@monorepo/front-core-lib';
import {HaPublicBrickDescriptionComponent} from './ha-public-brick-description/ha-public-brick-description.component';
import {MatLegacyCardModule as MatCardModule} from '@angular/material/legacy-card';
import {MatLegacyRadioModule as MatRadioModule} from '@angular/material/legacy-radio';
import {HaPublicDocComponent} from './ha-public-doc/ha-public-doc.component';
import {HaPublicEditBrickDialogComponent} from './ha-public-edit-brick-dialog/ha-public-edit-brick-dialog.component';
import {MatLegacyTooltipModule as MatTooltipModule} from "@angular/material/legacy-tooltip";
import {
  HaPublicBrickVersionDetailDialogComponent
} from './ha-public-brick-version-detail-dialog/ha-public-brick-version-detail-dialog.component';
import {HaPublicTechDocComponent} from './ha-public-tech-doc/ha-public-tech-doc.component';
import {Ha404Component} from '../ha404/ha404.component';
import {HaPublicFindDocComponent} from './ha-public-find-doc/ha-public-find-doc.component';
import { HaPublicBrickRightPanelComponent } from './ha-public-brick-right-panel/ha-public-brick-right-panel.component';

@NgModule({
  declarations: [
    HaPublicBrickPageComponent,
    HaPublicSidenavComponent,
    HaPublicSidenavCreateFormDialogComponent,
    HaPublicAddVersionDialogComponent,
    HaPublicVersionsComponent,
    HaPublicBrickVersionsTableComponent,
    HaPublicBrickDescriptionComponent,
    HaPublicDocComponent,
    HaPublicEditBrickDialogComponent,
    HaPublicBrickVersionDetailDialogComponent,
    HaPublicTechDocComponent,
    Ha404Component,
    HaPublicFindDocComponent,
    HaPublicBrickRightPanelComponent,
  ],
  imports: [
    HaPublicCoreModule,
    HaCoreModule,
    CoreModule,
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    FlDateModule,
    MatCardModule,
    FlKeyValueModule,
    MatRadioModule,
    FormsModule,
    MatTooltipModule,
    FlInputFileModule
  ]
})
export class HaPublicBrickPageModule {
}
