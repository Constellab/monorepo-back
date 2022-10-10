import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlThemeSwitchPipe} from './pipe/fl-theme-switch.pipe';


@NgModule({
  declarations: [
    FlThemeSwitchPipe
  ],
  exports: [
    FlThemeSwitchPipe
  ],
  imports: [
    CommonModule
  ]
})
export class FlThemeModule {
}
