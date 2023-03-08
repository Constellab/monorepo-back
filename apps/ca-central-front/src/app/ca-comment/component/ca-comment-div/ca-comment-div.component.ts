import {Component, Input, OnInit, Output} from '@angular/core';
import {CaProjectComment} from '../../../ca-core/model/entities/ca-comment.class';
import {CaEditCommentTextEditorConfig} from '../../../ca-core/model/config/ca-comment-text-editor.config';
import {CaProjectService} from '../../../ca-core/service-api/ca-project.service';
import {Subject} from 'rxjs';
import {FlEmojiPickerPortalComponent, FlOverlayRef, FlPortalService} from '@monorepo/front-core-lib';
import {CaMouseHoverCommentData} from '../../directive/ca-mouse-hover-comment-portal.directive';
import {CaAuthenticatedUserService} from '../../../ca-core/service-api/ca-authenticated-user.service';
import {CaCommentMenuPortalButton} from '../ca-comment-menu-portal/ca-comment-menu-portal.component';
import {FormControl, Validators} from '@angular/forms';
import {CmRichText, CmRichTextI} from '@monorepo/common-model';
import {CaProjectDetailState} from '../../../ca-project/module/ca-project-detail-page/state/ca-project-detail.state';

@Component({
  selector: 'ca-comment-div',
  templateUrl: './ca-comment-div.component.html',
  styleUrls: ['./ca-comment-div.component.scss']
})
export class CaCommentDivComponent implements OnInit {

  @Input()
  comment: CaProjectComment;

  @Output()
  eventOnMessage$: Subject<[FlOverlayRef, string]> = new Subject<[FlOverlayRef, string]>();

  buttons: CaCommentMenuPortalButton[] = [];

  data: CaMouseHoverCommentData;

  textEditorConfig: CaEditCommentTextEditorConfig = new CaEditCommentTextEditorConfig(this.projectService,
    this.state.getProjectId$());

  isEditMode$: Subject<boolean> = new Subject<boolean>();
  isLoading: boolean = false;
  formControl: FormControl;


  constructor(private projectService: CaProjectService,
              private authUserService: CaAuthenticatedUserService,
              private portalService: FlPortalService,
              private state: CaProjectDetailState) {
  }

  ngOnInit(): void {
    this.buttons = [
      {
        icon: 'add_reaction',
        text: 'Add reaction',
        type: 'button',
        onClick: (event: MouseEvent, overlayRef?: FlOverlayRef) => {
          this.eventOnMessage$.next([overlayRef, 'addReaction']);
        }
      }];
    if (this.authUserService.getUser().id === this.comment.createdBy.id && this.comment.createdAt.diffNow('minute').as('minute') > -5) {
      this.buttons.push({
        icon: 'edit',
        text: 'Edit',
        type: 'button',
        onClick: (event: MouseEvent, overlayRef?: FlOverlayRef) => {
          this.isEditMode$.next(true);
          this.formControl = new FormControl(this.comment.content, [Validators.required, Validators.min(1)]);
          this.eventOnMessage$.next([overlayRef, 'edit']);
        }
      },
      {
        icon: 'delete',
        text: 'Delete',
        type: 'button',
        onClick: (event, overlayRef: FlOverlayRef) => {
          this.eventOnMessage$.next([overlayRef, 'delete']);
        }
      });
    }
    this.data = {
      comment: this.comment,
      buttons: this.buttons
    };


    this.onEventOnEdit();
  }

  enterEvent(event: Event): void {
    event.preventDefault();
    this.editComment();
  }

  editComment(): void {
    this.projectService.editProjectComment(this.comment.project.id, this.comment.id,
      this.formControl.value).subscribe((comment: CaProjectComment) => {

      this.comment.content = comment.content;
      this.isEditMode$.next(false);
    });
  }

  private onEventOnEdit(): void {
    this.textEditorConfig.sendButtonEvent$.subscribe((event: boolean) => {
      if (event) {
        if (this.formControl.valid) {
          this.editComment();
        }
      } else {
        this.isEditMode$.next(false);
        this.formControl.setValue(this.comment.content);
      }
    });

    this.textEditorConfig.sendEmojiButtonEvent$.subscribe(btEmoji => {
      if (btEmoji) {
        this.openEmojiPannel(btEmoji);
      }
    });
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
      emoji => {
        if (emoji)
          this.addEmoji(emoji);
      }
    );
  }

  getCommentContent(): CmRichTextI {
    return this.comment.content;
  }

  atEvent(event: Event): void {
    console.log(event);
  }

  private addEmoji(event: string): void {
    this.formControl.setValue(CmRichText.addEmoji(this.formControl.value, event));
  }
}
