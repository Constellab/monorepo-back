import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaSmartDbPageComponent} from './component/ca-smart-db-page/ca-smart-db-page.component';
import {CaSmartDbDocResultComponent} from './component/ca-smart-db-doc-result/ca-smart-db-doc-result.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CaCoreModule} from '../ca-core/ca-core.module';
import {CaSmartDbRoutingModule} from './ca-smart-db-routing.module';
import {CaSmartDbHighlightPipe} from './ca-smart-db-highlight.pipe';
import {CaSmartDbSelectedDocComponent} from './component/ca-smart-db-selected-doc/ca-smart-db-selected-doc.component';
import {
  CaSmartDbResultContentComponent
} from './component/ca-smart-db-result-content/ca-smart-db-result-content.component';


@NgModule({
  declarations: [
    CaSmartDbPageComponent,
    CaSmartDbDocResultComponent,
    CaSmartDbHighlightPipe,
    CaSmartDbSelectedDocComponent,
    CaSmartDbResultContentComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    CaCoreModule,

    CaSmartDbRoutingModule,
  ]
})
export class CaSmartDbModule {
}
