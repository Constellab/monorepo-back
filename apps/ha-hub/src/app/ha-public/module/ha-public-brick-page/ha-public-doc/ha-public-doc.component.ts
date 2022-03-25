import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router, UrlSegment} from '@angular/router';
import {
  HaDocumentation,
  HaDocumentationContentFormDTO
} from '../../../../ha-core/ha-model/ha-entities/ha-documentation.class';
import {HaBrickService} from '../../../../ha-core/ha-service/ha-brick.service';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {HaDocumentationService} from '../../../../ha-core/ha-service/ha-documentation.service';
import {FlDebouncer} from '@monorepo/front-core-lib';
import {HaAuthenticatedUserService} from '../../../../ha-core/ha-service/ha-authenticated-user.service';
import {CmRichText, CmRichTextI} from '@monorepo/common-model';
import {Observable} from 'rxjs';

@Component({
  selector: 'ha-public-doc-page',
  templateUrl: './ha-public-doc.component.html',
  styleUrls: ['./ha-public-doc.component.scss']
})
export class HaPublicDocComponent implements OnInit, OnDestroy {

  private contentDebouncer: FlDebouncer<CmRichTextI>;
  documentation: HaDocumentation;
  brickName: string;
  brickVersion: string;
  formGp: FormGroup<Partial<HaDocumentationContentFormDTO>>;
  titles: any[] = [];
  richText: CmRichText;
  lastUrl: string = null;
  isAdmin: Observable<boolean> = this.authUserService.isAdmin();

  constructor(
    private brickService: HaBrickService,
    private documentationService: HaDocumentationService,
    private authUserService: HaAuthenticatedUserService,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }


  ngOnInit(): void {
    this.buildForm();
    this.route.parent.parent.url.subscribe(url => {
      this.brickName = url[0].path;
      this.brickVersion = url[1].path;
      this.getActiveDoc();
    });

    //create a debouncer to save the description after x second of idle
    this.contentDebouncer = new FlDebouncer(FlDebouncer.AUTO_SAVE_DEBOUNCE_TIME);
    this.contentDebouncer.getDebouncedValue().subscribe(
      value => this.saveContent(value)
    );
  }

  private getActiveDoc(): void {
    this.route.url.subscribe((url: UrlSegment[]) => {
      if (url.toString() != this.lastUrl && this.lastUrl != '') {
        this.getDocumentationByPath(url);
      }
      this.lastUrl = url.toString();
    });
  }

  buildForm(): void {
    this.formGp = new FormBuilder().group({
      id: [null],
      content: [null],
    });
  }

  private getDocumentationByPath(url: UrlSegment[]): void {
    let isFirstDoc: boolean = false;
    let path: string;
    if (url.length == 0) {
      isFirstDoc = true;
      this.brickService.getFirstDoc(this.brickName, this.brickVersion).subscribe(doc => {
        this.actionOnDoc(isFirstDoc, doc);
      });
    } else {
      path = url.join('/') + '/';
      this.brickService.getDocByPath(this.brickName, path, this.brickVersion).subscribe(doc => {
        this.actionOnDoc(isFirstDoc, doc);
      });
    }
  }

  private actionOnDoc(isFirstDoc: boolean, doc: HaDocumentation): void {
    if (isFirstDoc) {
      this.router.navigate([`${this.router.url}/${doc.completePath}`]);
    }
    this.documentation = doc;
    this.setFormGroupValue(doc);
    this.titles = [];
    if (this.formGp.value.content) {
      this.richText = new CmRichText(doc.content);
      this.titles = this.richText.getHeaders([1, 2, 3]);
    }
  }

  onContentUpdate(content: any): void {
    this.contentDebouncer.setValue(content);
    this.richText = new CmRichText(this.formGp.value.content as CmRichTextI)
    this.titles = this.richText.getHeaders([1, 2, 3]);
  }

  private setFormGroupValue(doc: HaDocumentationContentFormDTO): void {
    this.formGp.patchValue(doc);
  }

  private saveContent(value: CmRichTextI): void {
    this.formGp.value.content = value as CmRichTextI;
    this.isAdmin.subscribe(isAdmin => {
      if(isAdmin){
        this.documentationService.updateContent(this.formGp.value as HaDocumentationContentFormDTO).subscribe();
      }
    })

  }

  ngOnDestroy(): void {
    this.contentDebouncer.complete();
  }

}
