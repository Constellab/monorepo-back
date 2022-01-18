import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Params, UrlSegment} from '@angular/router';
import {Observable} from 'rxjs';
import {
  HaDocumentation,
  HaDocumentationContentFormDTO
} from '../../../../../../ha-core/ha-model/ha-entities/ha-documentation.class';
import {HaBrickService} from '../../../../../../ha-core/ha-service/ha-brick.service';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {HaDocumentationService} from '../../../../../../ha-core/ha-service/ha-documentation.service';
import {HaBrick} from '../../../../../../ha-core/ha-model/ha-entities/ha-brick.class';

@Component({
  selector: 'ha-public-doc-page',
  templateUrl: './ha-public-doc-page.component.html',
  styleUrls: ['./ha-public-doc-page.component.scss']
})
export class HaPublicDocPageComponent implements OnInit {

  documentation$: Observable<HaDocumentation>;
  brick: HaBrick;
  formGp: FormGroup<Partial<HaDocumentationContentFormDTO>>;
  currentContent: Record<string, any>;
  isEditing: boolean = false;

  constructor(
    private brickService: HaBrickService,
    private documentationService: HaDocumentationService,
    private route: ActivatedRoute
  ) {
  }


  ngOnInit(): void {
    this.route.parent.parent.url.subscribe(url => {
      this.getBrick(url[0].path);
    });
  }

  private getBrick(path: string): void{
    this.brickService.getByName(path).subscribe(brick => {
      this.brick = brick;
      this.getActiveDoc();
    });
  }

  private getActiveDoc(): void{
    this.route.url.subscribe((url: UrlSegment[]) => {
      this.getDocumentationByPath(url);
    });
  }

  buildForm(): void {
    this.formGp = new FormBuilder().group({
      id: [null],
      content: [null, Validators.required],
    });
  }

  private getDocumentationByPath(url: UrlSegment[]): void {

    let path: string;
    if(url.length == 0){
      path = 'getting-started/';
    } else {
      path = url.join('/') + '/';
    }
    console.log(path);
    this.documentation$ = this.brickService.getDocByPath(this.brick.id, path);
    this.documentation$.subscribe((doc: HaDocumentation) => {
      this.buildForm();
      this.setFormGroupValue(doc);
    });
  }

  private setFormGroupValue(doc: HaDocumentationContentFormDTO): void {
    this.formGp.patchValue(doc);
  }

  private startEditing(): void{
    this.isEditing = true;
    this.currentContent = this.formGp.value.content;
  }

  private cancelEditing(doc: HaDocumentation): void{
    this.isEditing = false;
    this.formGp.patchValue(doc);
  }

  private saveContent(): void{
    this.documentationService.updateContent(this.formGp.value).subscribe((doc: HaDocumentation) => {
      this.setFormGroupValue(doc);
      this.isEditing = false;
    });
  }
}
