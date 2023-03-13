import {Component, Inject, OnInit} from '@angular/core';
import {HaDocumentationService} from '../../../../ha-core/ha-service/ha-documentation.service';
import {HaDocumentationSearchDTO} from '../../../../ha-core/ha-model/ha-entities/ha-documentation.class';
import {mergeMap, Observable, of, startWith} from 'rxjs';
import {FormControl} from '@ngneat/reactive-forms';
import {map} from 'rxjs/operators';
import {HaBrickService} from '../../../../ha-core/ha-service/ha-brick.service';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';
import {HaRouterService} from '../../../../ha-core/ha-service/ha-router.service';
import {clRxjsElasticSearch, ClStringHelper} from '@monorepo/core-lib';

@Component({
  selector: 'ha-public-find-doc-dialog',
  templateUrl: './ha-public-find-doc.component.html',
  styleUrls: ['./ha-public-find-doc.component.scss']
})
export class HaPublicFindDocComponent implements OnInit {
  inputControl = new FormControl<string | HaDocumentationSearchDTO>('');
  documentations: HaDocumentationSearchDTO[];
  technicalDocumentations: HaDocumentationSearchDTO[];
  documentationsNotEmpty: boolean = true;
  filteredDocumentations$: Observable<HaDocumentationSearchDTO[]>;
  filteredTechnicalDocumentations$: Observable<HaDocumentationSearchDTO[]>;
  technicalDocumentationsNotEmpty: boolean = true;
  brickName: string;
  major: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) input: any,
    private dialogRef: MatDialogRef<HaPublicFindDocComponent>,
    private documentationService: HaDocumentationService,
    private brickService: HaBrickService
  ) {
    this.brickName = input.brickName;
    this.major = input.major;
  }

  displayFn(doc: HaDocumentationSearchDTO): string {
    return doc && doc.name ? doc.name : '';
  }

  private _filter(nameOrLink: string, isTechnical: boolean): HaDocumentationSearchDTO[] {
    return isTechnical ?
      this.technicalDocumentations.filter(documentation => documentation.name.toLowerCase().includes(nameOrLink.toLowerCase()))
      : this.documentations.filter(documentation => documentation.name.toLowerCase().includes(nameOrLink.toLowerCase()));
  }

  ngOnInit(): void {
    this.brickService.findDocumentationByBrickNameMajor(this.brickName, this.major).subscribe(docs => {
      this.documentations = docs.filter(doc => doc.isTechnical === false);
      this.technicalDocumentations = docs.filter(doc => doc.isTechnical === true);
      this.updateFilteredDocumentations();
    });
  }

  //Update possible options of the select from the input value
  private updateFilteredDocumentations(): void {
    this.filteredDocumentations$ = this.updateFiltered(false);
    this.filteredTechnicalDocumentations$ = this.updateFiltered(true);
  }

  private updateFiltered(isTechnical: boolean): Observable<HaDocumentationSearchDTO[]> {
    return this.inputControl.valueChanges.pipe(
      startWith(''),
      clRxjsElasticSearch(),
      mergeMap(value => {
        if (typeof value === 'string' && HaRouterService.isAValidDocUrl(value as string)[0] &&
          HaRouterService.isAValidDocUrl(value as string)[1] != isTechnical) {
          return HaRouterService.isAValidDocUrl(value as string)[1] ?
            this.getDocByLink(value as string) :
            this.getTechnicalDocByLink(value as string);
        } else if (typeof value === 'string') {
          const filteredRes: HaDocumentationSearchDTO[] = this._filter(value as string, isTechnical);
          if (isTechnical) {
            this.technicalDocumentationsNotEmpty = filteredRes.length > 0;
          } else {
            this.documentationsNotEmpty = filteredRes.length > 0;
          }
          return of(filteredRes);
        }
        return of([value] as HaDocumentationSearchDTO[]);
      }));

  }

  private getDocByLink(link: string): Observable<HaDocumentationSearchDTO[]> {
    return this.brickService.findDocumentationByLink(link as string).pipe(
      map(val => {
        if (val) {
          this.documentationsNotEmpty = true;
          return [val];
        }
        return [];
      })
    );
  }

  private getTechnicalDocByLink(link: string): Observable<HaDocumentationSearchDTO[]> {
    return this.brickService.findDocumentationByLink(link as string).pipe(
      map(val => {
        if (val) {
          this.technicalDocumentationsNotEmpty = true;
          return [val];
        }
        return [];
      })
    );
  }

  getCurrentInput(): HaDocumentationSearchDTO{
    return {
      name: this.inputControl.value as string
    }
  }

  isALink(input: any): boolean{
    return ClStringHelper.isHttpLink(input as string);
  }


  submit(value: HaDocumentationSearchDTO): void {
    this.dialogRef.close(value);
  }
}
