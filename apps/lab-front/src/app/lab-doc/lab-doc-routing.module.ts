import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {LabTechnicalDocComponent} from './component/lab-technical-doc/lab-technical-doc.component';

const routes: Routes = [
  {path: 'technical-doc/:typingName', component: LabTechnicalDocComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LabDocRoutingModule {
}
