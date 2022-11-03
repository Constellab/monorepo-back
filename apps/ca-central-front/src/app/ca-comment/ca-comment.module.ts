import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaCommentDivComponent } from './component/ca-comment-div/ca-comment-div.component';
import {CaCoreModule} from '../ca-core/ca-core.module';
import {FormsModule} from '@angular/forms';



@NgModule({
  declarations: [
    CaCommentDivComponent
  ],
  exports: [
    CaCommentDivComponent
  ],
  imports: [
    CommonModule,
    CaCoreModule,
    FormsModule
  ]
})
export class CaCommentModule { }
