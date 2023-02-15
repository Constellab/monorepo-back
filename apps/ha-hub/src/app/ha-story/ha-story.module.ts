import {NgModule} from '@angular/core';
import {HaStoryRoutingModule} from './ha-story-routing.module';
import {HaStoryPageComponent} from './module/ha-story-page/ha-story-page.component';
import {HaStoryEditPageComponent} from './module/ha-story-edit-page/ha-story-edit-page.component';
import {HaStoryListPageComponent} from './module/ha-story-list-page/ha-story-list-page.component';
import {HaCustomLibraryModule} from "../ha-core/ha-custom-library/ha-custom-library.module";
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HaCustomMaterialModule} from '../ha-core/ha-custom-material/ha-custom-material.module';
import {HaCoreModule} from '../ha-core/ha-core.module';
import { HaStoryCreateDialogComponent } from './module/ha-story-create-dialog/ha-story-create-dialog.component';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {FlDateModule} from "@monorepo/front-core-lib";
import { HaStoryMyListComponent } from './module/ha-story-my-list/ha-story-my-list.component';
import {MatTableModule} from "@angular/material/table";
import {MatRadioModule} from "@angular/material/radio";
import { HaStoryCoAuthorDialogComponent } from './module/ha-story-co-author-dialog/ha-story-co-author-dialog.component';
import { HaStoryInvitePageComponent } from './module/ha-story-invite-page/ha-story-invite-page.component';

@NgModule({
  declarations: [HaStoryPageComponent, HaStoryEditPageComponent, HaStoryListPageComponent, HaStoryCreateDialogComponent, HaStoryMyListComponent, HaStoryCoAuthorDialogComponent, HaStoryInvitePageComponent],
  imports: [
    HaStoryRoutingModule,
    HaCustomLibraryModule,
    ReactiveFormsModule,
    HaCustomMaterialModule,
    HaCoreModule,
    NgIf,
    AsyncPipe,
    NgForOf,
    FlDateModule,
    MatTableModule,
    MatRadioModule,
    FormsModule,
  ]
})
export class HaStoryModule {
}
