import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {FlSnackBarService} from './fl-snack-bar.service';
import {FlSnackBarInfoComponent} from './component/fl-snack-bar-info/fl-snack-bar-info.component';
import {MatButtonModule} from '@angular/material/button';
import {FlexLayoutModule} from '@angular/flex-layout';

/**
 * Core modules containing components
 */
@NgModule({
  declarations: [
    FlSnackBarInfoComponent
  ],
  exports: [],
  imports: [
    CommonModule,

    FlTranslateModule,

    // Material
    MatSnackBarModule,
    MatButtonModule,
    FlexLayoutModule,
  ]
})
export class FlSnackBarModule {

  public static forRoot(): ModuleWithProviders<FlSnackBarModule> {
    return {
      ngModule: FlSnackBarModule,
      providers: [FlSnackBarService]
    };
  }
}
