import {Component, Inject, OnInit} from '@angular/core';
import {HaDocumentationService} from '../../../../ha-core/ha-service/ha-documentation.service';
import {HaDocumentationSearchDTO} from '../../../../ha-core/ha-model/ha-entities/ha-documentation.class';
import {mergeMap, Observable, of, startWith} from 'rxjs';
import {FormControl} from '@ngneat/reactive-forms';
import {map} from 'rxjs/operators';
import {HaBrickService} from '../../../../ha-core/ha-service/ha-brick.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {HaRouterService} from '../../../../ha-core/ha-service/ha-router.service';
import {clRxjsElasticSearch} from '@monorepo/core-lib';
import {HaTechnicalFolderService} from '../../../../ha-core/ha-service/ha-technical-folder.service';

@Component({
  selector: 'ha-public-find-doc-dialog',
  templateUrl: './ha-public-find-doc.component.html',
  styleUrls: ['./ha-public-find-doc.component.scss']
})
export class HaPublicFindDocComponent implements OnInit {
  inputControl = new FormControl<string | HaDocumentationSearchDTO>('');
  documentations: HaDocumentationSearchDTO[];
  technicalDocumentations: HaDocumentationSearchDTO[];
  filteredDocumentations$: Observable<HaDocumentationSearchDTO[]>;
  filteredTechnicalDocumentations$: Observable<HaDocumentationSearchDTO[]>;
  brickName: string;
  major: string;
  searchByLink: boolean = false;

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
          return of(this._filter(value as string, isTechnical));
        }
        return of([value] as HaDocumentationSearchDTO[]);
      }));
  }

  private getDocByLink(link: string): Observable<HaDocumentationSearchDTO[]> {
    return this.brickService.findDocumentationByLink(link as string).pipe(
      map(val => {
        return [val];
      })
    );
  }

  private getTechnicalDocByLink(link: string): Observable<HaDocumentationSearchDTO[]> {
    return this.brickService.findDocumentationByLink(link as string).pipe(
      map(val => {
        return [val];
      })
    );
  }


  submit(value: HaDocumentationSearchDTO): void {
    this.dialogRef.close(value);
  }
}
