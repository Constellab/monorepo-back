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
import {MatTableModule} from "@angular/material/table";
import {FlDateModule, FlInputFileModule, FlKeyValueModule} from '@monorepo/front-core-lib';
import {HaPublicBrickDescriptionComponent} from './ha-public-brick-description/ha-public-brick-description.component';
import {MatCardModule} from '@angular/material/card';
import {MatRadioModule} from '@angular/material/radio';
import {HaPublicDocComponent} from './ha-public-doc/ha-public-doc.component';
import {
  HaPublicSidenavImportTecDocDialogComponent
} from './ha-public-sidenav-import-tec-doc-dialog/ha-public-sidenav-import-tec-doc-dialog.component';
import {HaPublicEditBrickDialogComponent} from './ha-public-edit-brick-dialog/ha-public-edit-brick-dialog.component';
import {MatTooltipModule} from "@angular/material/tooltip";
import {
  HaPublicBrickVersionDetailDialogComponent
} from './ha-public-brick-version-detail-dialog/ha-public-brick-version-detail-dialog.component';
import {HaPublicTechDocComponent} from './ha-public-tech-doc/ha-public-tech-doc.component';
import {Ha404Component} from '../ha404/ha404.component';
import {HaPublicFindDocDialogComponent} from './ha-public-find-doc-dialog/ha-public-find-doc-dialog.component';

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
    HaPublicSidenavImportTecDocDialogComponent,
    HaPublicEditBrickDialogComponent,
    HaPublicBrickVersionDetailDialogComponent,
    HaPublicTechDocComponent,
    Ha404Component,
    HaPublicFindDocDialogComponent,
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
