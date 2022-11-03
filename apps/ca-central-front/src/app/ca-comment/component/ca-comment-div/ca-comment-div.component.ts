import {Component, Input, OnInit} from '@angular/core';
import {CaComment} from '../../../ca-core/model/entities/ca-comment.class';
import {FlTextEditorBasicConfig, FlTextEditorConfig} from '@monorepo/front-core-lib';

@Component({
  selector: 'ca-comment-div',
  templateUrl: './ca-comment-div.component.html',
  styleUrls: ['./ca-comment-div.component.scss']
})
export class CaCommentDivComponent implements OnInit {

  @Input()
  comment: CaComment;

  textEditorConfig: FlTextEditorConfig = new FlTextEditorBasicConfig();

  constructor() { }

  ngOnInit(): void {
  }

}
