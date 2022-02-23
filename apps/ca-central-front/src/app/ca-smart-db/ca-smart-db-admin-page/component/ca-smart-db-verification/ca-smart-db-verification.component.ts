import {Component, OnInit} from '@angular/core';
import {CaSmartDbService} from '../../../service/ca-smart-db.service';
import {ClPageI} from '@monorepo/core-lib';
import {CaSmartDbDoc} from '../../../model/ca-document.class';
import {FlSnackBarService} from '@monorepo/front-core-lib';

/**
 * In admin section to validate manually the docs
 */
@Component({
  selector: 'ca-smart-db-verification',
  templateUrl: './ca-smart-db-verification.component.html',
  styleUrls: ['./ca-smart-db-verification.component.scss']
})
export class CaSmartDbVerificationComponent implements OnInit {

  doc: CaSmartDbDoc;
  totalNumber: number;

  getIsLoading: boolean = false;
  validateIsLoading: boolean = false;

  constructor(private smartDbService: CaSmartDbService,
              private snackBarService: FlSnackBarService) {
  }

  ngOnInit(): void {
    this.getNextDocument();
  }

  getNextDocument(): void {
    if (this.isLoading) return;
    this.getIsLoading = true;
    this.smartDbService.getNotValidated(0, 1).subscribe(
      doc => this.getNextDocumentSuccess(doc),
      () => this.getIsLoading = false
    );
  }

  private getNextDocumentSuccess(documents: ClPageI<CaSmartDbDoc>): void {
    this.totalNumber = documents.totalElements;
    if (documents.objects.length > 0) {
      this.doc = documents.objects[0];
    }

    this.getIsLoading = false;
  }

  public validateDoc(): void {
    if (this.validateIsLoading) return;

    this.validateIsLoading = true;
    this.smartDbService.validateDoc(this.doc).subscribe(
      () => this.validateDocSuccess(),
      () => this.validateIsLoading = false
    );
  }

  private validateDocSuccess(): void {
    this.snackBarService.openSuccessMessage({text: 'smart_db.doc_saved', translateText: true});
    this.validateIsLoading = false;

    this.getNextDocument();
  }

  deleteSentence(index: number): void {
    this.doc.sentences.splice(index, 1);
  }


  get isLoading(): boolean {
    return this.getIsLoading || this.validateIsLoading;
  }

}
