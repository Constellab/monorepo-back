import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {HaDocumentationService} from '../../../../ha-core/ha-service/ha-documentation.service';
import {HaDocumentationSearchDTO} from '../../../../ha-core/ha-model/ha-entities/ha-documentation.class';
import {Observable, startWith} from 'rxjs';
import {FormControl} from '@ngneat/reactive-forms';
import {map} from 'rxjs/operators';
import {HaBrickService} from '../../../../ha-core/ha-service/ha-brick.service';
import {environment} from "../../../../../environments/ha-environment";

@Component({
  selector: 'ha-public-find-doc-dialog',
  templateUrl: './ha-public-find-doc-dialog.component.html',
  styleUrls: ['./ha-public-find-doc-dialog.component.scss']
})
export class HaPublicFindDocDialogComponent implements OnInit, OnDestroy {
  myControl = new FormControl<string | HaDocumentationSearchDTO>('');
  documentations: HaDocumentationSearchDTO[];
  documentationsByLink: HaDocumentationSearchDTO[];
  filteredDocumentations: Observable<HaDocumentationSearchDTO[]>;
  brickName: string;
  major: string;
  searchByLink: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) input: any,
    private dialogRef: MatDialogRef<HaPublicFindDocDialogComponent>,
    private documentationService: HaDocumentationService,
    private brickService: HaBrickService
  ) {
    this.brickName = input.brickName;
    this.major = input.major;
  }

  displayFn(doc: HaDocumentationSearchDTO): string {
    return doc && doc.name ? doc.name : '';
  }

  private _filter(nameOrLink: string): HaDocumentationSearchDTO[] {
    return this.documentations.filter(documentation => documentation.name.toLowerCase().includes(nameOrLink.toLowerCase()));
  }

  ngOnInit(): void {
    this.brickService.findDocumentationByBrickNameMajor(this.brickName, this.major).subscribe(docs => {
      this.documentations = docs;
      this.updateFilteredDocumentations();
    });

    this.myControl.valueChanges.subscribe((val: string | HaDocumentationSearchDTO) => {
      if (typeof val === 'string' && this.isAValidLink(val as string)) {
        this.brickService.findDocumentationByLink(val).subscribe((doc: HaDocumentationSearchDTO) => {
          if (doc && doc.id) {
            this.documentationsByLink = [doc];
            this.searchByLink = true;
            this.updateFilteredDocumentations();
          }
        });
      } else if(typeof val === 'string') {
        this.searchByLink = false;
        this.documentationsByLink = [];
      } else {
        this.submit(val);
      }
    });
  }

  private updateFilteredDocumentations(): void {
    this.filteredDocumentations = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const nameOrLink = typeof value === 'string' ? value : value?.name;
        return nameOrLink ? this._filter(nameOrLink as string)
          : (this.searchByLink ? this.documentationsByLink.slice() : this.documentations.slice());
      }),
    );
  }

  private isAValidLink(val: string): boolean {
    if (val.startsWith(environment.hubUrl)) {
      val = val.slice(environment.hubUrl.length);
      const link: string[] = val.split('/');
      return link.length >= 5 && link[0] === 'bricks' && link[3] == 'doc' && link[4] != 'technical-folder';
    }
    return false;
  }

  submit(val : HaDocumentationSearchDTO): void {
    this.dialogRef.close(val);
  }

  ngOnDestroy(): void {

  }
}
