import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {CaProject} from '../../../../../ca-core/model/entities/ca-project.class';
import {CaProjectDetailState} from '../../state/ca-project-detail.state';
import {CaProjectCommentDatasourcePaginated} from '../../../../../ca-core/model/entities/ca-comment.class';
import {CaProjectService} from '../../../../../ca-core/service-api/ca-project.service';
import {CaAuthenticatedUserService} from '../../../../../ca-core/service-api/ca-authenticated-user.service';
import {CaCommentTextEditorConfig} from '../../../../../ca-core/model/config/ca-comment-text-editor.config';
import {FormControl, Validators} from '@angular/forms';
import {CmRichText} from '@monorepo/common-model';
import {FlOverlayRef, FlPortalService} from '@monorepo/front-core-lib';
import {
  FlEmojiPickerPortalComponent
} from '../../../../../../../../../libs/front-core-lib/src/lib/module/fl-emoji-picker/component/fl-emoji-picker-portal/fl-emoji-picker-portal.component';


@Component({
  selector: 'ca-project-comments',
  templateUrl: './ca-project-comments.component.html',
  styleUrls: ['./ca-project-comments.component.scss']
})
export class CaProjectCommentsComponent implements OnInit, OnDestroy {

  isEmojiPickerVisible: boolean;
  openEmojiPicker: boolean = false;
  project$: Observable<CaProject>;
  comments: CaProjectCommentDatasourcePaginated;
  currentUserId: string;
  textEditorConfig: CaCommentTextEditorConfig = new CaCommentTextEditorConfig(this.projectService);
  formControl: FormControl;
  isLoading: boolean = false;
  projectId: string;

  constructor(private state: CaProjectDetailState,
              private projectService: CaProjectService,
              private userService: CaAuthenticatedUserService,
              private portalService: FlPortalService
  ) {
  }

  ngOnInit(): void {
    this.project$ = this.state.getProject$();
    this.formControl = new FormControl({value: null}, [Validators.required, Validators.min(1)]);

    this.project$.subscribe(project => {
      this.projectId = project.id;
      this.comments = this.projectService.getProjectComments(this.projectId);
    });


    this.currentUserId = this.userService.getUser().id;

    this.textEditorConfig.sendButtonEvent$.subscribe(btEvent => {
      if (btEvent) {
        this.createNewComment();
      }
    });

    this.textEditorConfig.sendEmojiButtonEvent$.subscribe(btEmoji => {
      if (btEmoji) {
        this.openEmojiPannel(btEmoji);
      }
    })
  }

  enterEvent(event: Event): void {
    event.preventDefault();
    this.createNewComment();
  }


  private createNewComment(): void{
    if (!CmRichText.isEmpty(this.formControl.value)) {
      this.projectService.newProjectComment(this.projectId, this.formControl.value).subscribe((newComment) => {
        if (newComment) {
          this.comments.addItem(newComment, () => true);
        }
      });
      this.formControl.setValue(null);
    }
  }

  closeEmojiPicker(event: Event): void {
    const element: HTMLElement = event.target as HTMLElement;
    if (element.classList.contains('mat-icon') && this.openEmojiPicker == false) {
      this.openEmojiPicker = true;
      return;
    }

    if (this.isEmojiPickerVisible) {
      this.isEmojiPickerVisible = false;
      this.openEmojiPicker = false;
    }
  }

  addEmoji(event: string): void {
    this.formControl.setValue(CmRichText.addEmoji(this.formControl.value, event));
  }

  private openEmojiPannel(btEmoji: HTMLElement): void {
    const config = this.portalService.configureRelativePortal(btEmoji, ['top', 'bottom', 'left', 'right'],
      {
        hasBackdrop: true,
        disposeOnNavigation: true,
        disposeOnBackdropClick: true,
        transparentBackdrop: true
      });
    this.portalService.createPortal(FlEmojiPickerPortalComponent, config).detachments().subscribe(
      emoji => this.addEmoji(emoji)
    );;
  }

  ngOnDestroy(): void {
    this.textEditorConfig.sendButtonEvent$.complete();
    this.textEditorConfig.sendEmojiButtonEvent$.complete();
  }

}
