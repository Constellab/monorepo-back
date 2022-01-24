import {Component, Input, OnDestroy, OnInit} from '@angular/core';
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
import {LabReportContent} from '../../../../../../../../../lab-front/src/app/lab-core/model/entities/lab-report.entity';
import {FlDebouncer} from '@monorepo/front-core-lib';
import {HaAuthenticatedUserService} from '../../../../../../ha-core/ha-service/ha-authenticated-user.service';

@Component({
  selector: 'ha-public-doc-page',
  templateUrl: './ha-public-doc-page.component.html',
  styleUrls: ['./ha-public-doc-page.component.scss']
})
export class HaPublicDocPageComponent implements OnInit, OnDestroy {

  private contentDebouncer: FlDebouncer<Record<string, any>>;
  documentation$: Observable<HaDocumentation>;
  brick: HaBrick;
  formGp: FormGroup<Partial<HaDocumentationContentFormDTO>>;
  isAdmin: Observable<boolean> = this.authUserService.isAdmin();
  canEdit: boolean = false;

  constructor(
    private brickService: HaBrickService,
    private documentationService: HaDocumentationService,
    private authUserService: HaAuthenticatedUserService,
    private route: ActivatedRoute
  ) {
  }


  ngOnInit(): void {
    this.route.parent.parent.url.subscribe(url => {
      this.getBrick(url[0].path);
    });

    // create a debouncer to save the description after x second of idle
    this.contentDebouncer = new FlDebouncer(FlDebouncer.AUTO_SAVE_DEBOUNCE_TIME);
    this.contentDebouncer.getDebouncedValue().subscribe(
      value => this.saveContent(value)
    );
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
    this.documentation$ = this.brickService.getDocByPath(this.brick.id, path);
    this.documentation$.subscribe((doc: HaDocumentation) => {
      this.buildForm();
      this.setFormGroupValue(doc);
    });
  }

  onContentUpdate(content: LabReportContent): void {
    this.contentDebouncer.setValue(content);
  }

  private setFormGroupValue(doc: HaDocumentationContentFormDTO): void {
    this.formGp.patchValue(doc);
  }

  private saveContent(value: Record<string, any>): void{
    console.log('Save')
    this.formGp.value.content = value;
    this.documentationService.updateContent(this.formGp.value as HaDocumentationContentFormDTO).subscribe();
  }

  ngOnDestroy() {
    this.contentDebouncer.complete();
  }
}
