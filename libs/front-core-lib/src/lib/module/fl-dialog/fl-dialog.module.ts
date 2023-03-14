import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatIconModule} from '@angular/material/icon';
import {FlDialogHeaderComponent} from './component/fl-dialog-header/fl-dialog-header.component';
import {FlConfirmDialogComponent} from './component/fl-confirm-dialog/fl-confirm-dialog.component';
import {FlDialogService} from './fl-dialog.service';
import {FlLoaderModule} from '../fl-loader/fl-loader.module';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import {FlSnackBarModule} from '../fl-snack-bar/fl-snack-bar.module';
import { MatDialogModule } from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';

/**
 * Core modules containing components
 */
@NgModule({
  declarations: [
    FlConfirmDialogComponent,
    FlDialogHeaderComponent
  ],
  exports: [
    FlDialogHeaderComponent,

    MatDialogModule,
  ],
  imports: [
    CommonModule,

    FlLoaderModule,
    FlTranslateModule,
    FlSnackBarModule,

    // Material
    FlexLayoutModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ]
})
export class FlDialogModule {

  public static forRoot(): ModuleWithProviders<FlDialogModule> {
    return {
      ngModule: FlDialogModule,
      providers: [FlDialogService]
    };
  }
}
