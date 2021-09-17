import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@ngneat/reactive-forms';
import { Observable } from 'rxjs';
import { Validators } from '@angular/forms';
import { DaDocumentation } from '../../../../da-core/da-model/da-entities/da-documentation.class';
import { DaDocumentationService } from '../../../../da-core/da-service/da-documentation.service';

@Component({
    selector: 'da-admin-doc-form',
    templateUrl: './da-admin-doc-form.component.html',
    styleUrls: ['./da-admin-doc-form.component.scss']
})
export class DaAdminDocFormComponent implements OnInit {

    @Input() documentation?: DaDocumentation;

    formGp: FormGroup<DaDocumentation>;
    isUpdate = false;

    constructor(
        private daDocumentationService: DaDocumentationService,
    ) { }

    ngOnInit(): void {
        this.buildForm();
        if(this.documentation) this.isUpdate = true;
    }

    buildForm(): void {
        this.formGp = new FormBuilder().group({
            id: [null],
            title: [null, Validators.required],
            content: [null, Validators.required]
        })
        if (this.documentation) this.setFormGroupValue(this.documentation);
    }

    submit(): void {
        //Button loader
        if (this.isUpdate) {
            this.update(this.formGp.value).subscribe();
        } else {
            this.create(this.formGp.value).subscribe();
        }
    }

    private setFormGroupValue(doc: DaDocumentation): void {
        this.formGp.patchValue(doc);
    }

    private create(formValue: DaDocumentation): Observable<DaDocumentation> {
        return this.daDocumentationService.create(formValue);
        // FL SnackBarService
    }

    private update(formValue: DaDocumentation): Observable<DaDocumentation> {
        return this.daDocumentationService.update(formValue);
        // FL SnackBarService
    }
}