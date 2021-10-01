import { NgModule } from '@angular/core';
import { DaPublicDocPageComponent } from './da-public-doc-page/da-public-doc-page.component';
import {DaCoreModule} from '../../../da-core/da-core.module';
import {CoreModule} from '@angular/flex-layout';
import {DaPublicCoreModule} from '../da-public-core/da-public-core.module';

@NgModule({
  declarations: [DaPublicDocPageComponent],
  imports: [
    DaPublicCoreModule,
    DaCoreModule,
    CoreModule,
  ]
})
export class DaPublicDocPageModule { }
