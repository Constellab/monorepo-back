import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {
  DaDocumentation,
  DaDocumentationDTO,
  DaDocumentationFormDTO
} from '../../../../da-core/da-model/da-entities/da-documentation.class';
import {DaDocumentationService} from '../../../../da-core/da-service/da-documentation.service';
import {FlSnackBarService} from '@monorepo/front-core-lib';
import {Router} from '@angular/router';
import {DaFolderService} from '../../../../da-core/da-service/da-folder.service';
import {DaFolder} from '../../../../da-core/da-model/da-entities/da-folder.class';

@Component({
  selector: 'da-admin-doc-form',
  templateUrl: './da-admin-doc-form.component.html',
  styleUrls: ['./da-admin-doc-form.component.scss']
})
export class DaAdminDocFormComponent implements OnInit {

  @Input() documentation?: DaDocumentation;

  formGp: FormGroup<DaDocumentationFormDTO>;
  folder: DaFolder;
  folders: DaFolder[];
  isUpdate = false;
  isLoading = false;

  constructor(
    private daDocumentationService: DaDocumentationService,
    private daFolderService: DaFolderService,
    private snackBarService: FlSnackBarService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.buildForm();

    this.daFolderService.get().subscribe(folders => {
      this.folders = folders;
    });
  }

  buildForm(): void {
    this.formGp = new FormBuilder().group({
      id: [null],
      title: [null, Validators.required],
      content: [null, Validators.required],
      folderId: [null, Validators.required],
      path: [null, Validators.required],
      order: [null, Validators.required]
    })
    if (this.documentation) {
      this.setFormGroupValue(this.documentation);
      this.isUpdate = true;
    }
  }

  submit(): void {
    if (this.formGp.valid) {
      this.isLoading = true;

      if (this.isUpdate) {
        this.update(this.formGp.value);
      } else {
        this.create(this.formGp.value);
      }
    }
  }

  private setFormGroupValue(doc: DaDocumentationFormDTO): void {
    this.formGp.patchValue(doc);
  }

  private create(formValue: DaDocumentationFormDTO): void {
    this.daDocumentationService.create(formValue).subscribe(() => {
      this.creationSuccess();
    },
    () => this.isLoading = false);
  }

  private creationSuccess(): void {
    this.snackBarService.openSuccessMessage('documentation_created', true);
    this.isLoading = false;
  }

  private update(formValue: DaDocumentationFormDTO): void {
    this.daDocumentationService.update(formValue).subscribe(() => {
      this.snackBarService.openSuccessMessage('documentation_uptated', true);
      this.isLoading = false;
    },
    () => this.isLoading = false);
  }
}
