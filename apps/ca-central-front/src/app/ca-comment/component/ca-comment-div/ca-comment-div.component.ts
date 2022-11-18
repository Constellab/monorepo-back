import {Component, Input, OnInit} from '@angular/core';
import {CaComment} from '../../../ca-core/model/entities/ca-comment.class';
import {CaCommentTextEditorConfig} from '../../../ca-core/model/config/ca-comment-text-editor.config';
import {CaProjectService} from '../../../ca-core/service-api/ca-project.service';

@Component({
  selector: 'ca-comment-div',
  templateUrl: './ca-comment-div.component.html',
  styleUrls: ['./ca-comment-div.component.scss']
})
export class CaCommentDivComponent implements OnInit {

  @Input()
  comment: CaComment;

  textEditorConfig: CaCommentTextEditorConfig = new CaCommentTextEditorConfig(this.projectService);

  constructor(private projectService: CaProjectService) {
  }

  ngOnInit(): void {
  }

}
