import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@ngneat/reactive-forms';
import { Observable } from 'rxjs';
import { Validators } from '@angular/forms';
import { DaDocumentation } from '../../../../da-core/da-model/da-entities/da-documentation.class';
import { DaDocumentationService } from '../../../../da-core/da-service/da-documentation.service';
import { FlSnackBarService } from '@monorepo/front-core-lib';
import { Router } from '@angular/router';

@Component({
    selector: 'da-admin-doc-form',
    templateUrl: './da-admin-doc-form.component.html',
    styleUrls: ['./da-admin-doc-form.component.scss']
})
export class DaAdminDocFormComponent implements OnInit {

    @Input() documentation?: DaDocumentation;

    formGp: FormGroup<DaDocumentation>;
    isUpdate = false;
    isLoading = false;

    constructor(
        private daDocumentationService: DaDocumentationService,
        private snackBarService: FlSnackBarService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.buildForm();
    }

    buildForm(): void {
        this.formGp = new FormBuilder().group({
            id: [null],
            title: [null, Validators.required],
            content: [null, Validators.required]
        })
        if (this.documentation){
            this.setFormGroupValue(this.documentation);
            this.isUpdate = true;
        }
    }

    submit(): void {
        this.isLoading = true;
        if (this.isUpdate) {
            this.update(this.formGp.value);
        } else {
            this.create(this.formGp.value);
        }
    }

    private setFormGroupValue(doc: DaDocumentation): void {
        this.formGp.patchValue(doc);
    }

    private create(formValue: DaDocumentation): DaDocumentation {
        let createdDoc:DaDocumentation;
        this.daDocumentationService.create(formValue).subscribe(cDoc => {
            createdDoc = cDoc;
            this.snackBarService.openSuccessMessage('New documentation created !');
            this.isLoading = false;
            this.router.navigate(['admin']);
        });
        return createdDoc;
    }

    private update(formValue: DaDocumentation): DaDocumentation {
        let updatedDoc:DaDocumentation; 
        this.daDocumentationService.update(formValue).subscribe(uDoc => {
            updatedDoc = uDoc;
            this.snackBarService.openSuccessMessage('Documentation uptated !');
            this.isLoading = false;
            this.router.navigate(['admin']);
        });
        return updatedDoc;
    }
}