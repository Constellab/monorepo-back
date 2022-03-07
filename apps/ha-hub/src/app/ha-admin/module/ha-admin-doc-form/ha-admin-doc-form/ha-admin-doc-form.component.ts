import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {HaDocumentation, HaDocumentationFormDTO} from '../../../../ha-core/ha-model/ha-entities/ha-documentation.class';
import {HaDocumentationService} from '../../../../ha-core/ha-service/ha-documentation.service';
import {FlGlobalValidators, FlSnackBarService} from '@monorepo/front-core-lib';
import {HaFolderService} from '../../../../ha-core/ha-service/ha-folder.service';
import {HaFolder} from '../../../../ha-core/ha-model/ha-entities/ha-folder.class';

@Component({
  selector: 'ha-admin-doc-form',
  templateUrl: './ha-admin-doc-form.component.html',
  styleUrls: ['./ha-admin-doc-form.component.scss']
})
export class HaAdminDocFormComponent implements OnInit {

  @Input() documentation?: HaDocumentation;

  formGp: FormGroup<Partial<HaDocumentationFormDTO>>;
  folder: HaFolder;
  folders: HaFolder[];
  isUpdate = false;
  isLoading = false;
  re = new RegExp('^(0|[1-9][0-9]*)$');

  constructor(
    private daDocumentationService: HaDocumentationService,
    private daFolderService: HaFolderService,
    private snackBarService: FlSnackBarService,
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
      path: [null, [Validators.required, Validators.pattern('^[a-z0-9A-Z-]+$')]],
      order: [null, [Validators.required, Validators.min(0), FlGlobalValidators.isInteger()]]
    });
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

  private setFormGroupValue(doc: HaDocumentationFormDTO): void {
    this.formGp.patchValue(doc);
  }

  private create(formValue: Partial<HaDocumentationFormDTO>): void {
    this.daDocumentationService.create(formValue).subscribe(() => {
        this.creationSuccess();
      },
      () => this.isLoading = false);
  }

  private creationSuccess(): void {
    this.snackBarService.openSuccessMessage({text: 'documentation_created', translateText: true});
    this.isLoading = false;
  }

  private update(formValue: Partial<HaDocumentationFormDTO>): void {
    this.daDocumentationService.update(formValue).subscribe(() => {
        this.snackBarService.openSuccessMessage({text: 'documentation_uptated', translateText: true});
        this.isLoading = false;
      },
      () => this.isLoading = false);
  }
}
