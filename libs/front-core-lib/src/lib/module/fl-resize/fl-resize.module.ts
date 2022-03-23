import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlResizeFullscreenButtonComponent} from './fl-resize-fullscreen-button/fl-resize-fullscreen-button.component';
import {FlResizeDirective} from './fl-resize/fl-resize.directive';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';


@NgModule({
  declarations: [
    FlResizeFullscreenButtonComponent,
    FlResizeDirective,
  ],
  exports: [
    FlResizeFullscreenButtonComponent,
    FlResizeDirective,
  ],
  imports: [
    CommonModule,

    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
})
export class FlResizeModule { }
