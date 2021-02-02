import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CoreModule} from '../../core.module';
import { BioxConfigureSpecsComponent } from './component/biox-configure-specs/biox-configure-specs.component';
import { BioxConfigureSpecsDialogComponent } from './component/biox-configure-specs-dialog/biox-configure-specs-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { BioxShowConfigPortalComponent } from './component/biox-show-config-portal/biox-show-config-portal.component';


@NgModule({
  declarations: [
    BioxConfigureSpecsComponent,
    BioxConfigureSpecsDialogComponent,
    BioxShowConfigPortalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    CoreModule,
  ],
  exports: [BioxConfigureSpecsComponent, BioxShowConfigPortalComponent]
})
export class BioxConfigCoreModule { }
