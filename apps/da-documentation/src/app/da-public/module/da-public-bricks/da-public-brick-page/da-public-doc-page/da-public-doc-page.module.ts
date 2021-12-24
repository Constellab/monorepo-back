import {NgModule} from '@angular/core';
import {DaPublicDocPageComponent} from './da-public-doc-page/da-public-doc-page.component';
import {DaCoreModule} from '../../../../../da-core/da-core.module';
import {CoreModule} from '@angular/flex-layout';

@NgModule({
  declarations: [DaPublicDocPageComponent],
  imports: [DaCoreModule, DaCoreModule, CoreModule]
})
export class DaPublicDocPageModule {
}
