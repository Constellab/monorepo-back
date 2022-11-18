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

@Component({
  selector: 'ca-project-comments',
  templateUrl: './ca-project-comments.component.html',
  styleUrls: ['./ca-project-comments.component.scss']
})
export class CaProjectCommentsComponent implements OnInit, OnDestroy {

  project$: Observable<CaProject>;
  comments: CaProjectCommentDatasourcePaginated;
  currentUserId: string;
  textEditorConfig: CaCommentTextEditorConfig = new CaCommentTextEditorConfig(this.projectService);
  formControl: FormControl;
  isLoading: boolean = false;
  projectId: string;

  constructor(private state: CaProjectDetailState,
              private projectService: CaProjectService,
              private userService: CaAuthenticatedUserService
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
      if(btEvent){
        this.createNewComment();
      }
    });

    this.textEditorConfig.sendEmojiButtonEvent$.subscribe(btEmojiEvent => {
      if(btEmojiEvent){
        this.openEmojiPannel();
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

  private openEmojiPannel(): void{

  }

  ngOnDestroy(): void {
    this.textEditorConfig.sendButtonEvent$.complete();
    this.textEditorConfig.sendEmojiButtonEvent$.complete();
  }

}
