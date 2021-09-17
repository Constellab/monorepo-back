import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Observable} from 'rxjs';
import { Validators } from '@angular/forms';
import { DaDocumentation, DaDocumentationForm } from '../../../../da-core/da-model/da-entities/da-documentation.class';
import { DaDocumentationService } from '../../../../da-core/da-service/da-documentation.service';

@Component({
    selector: 'da-admin-doc-form',
    templateUrl: './da-admin-doc-form.component.html',
    styleUrls: ['./da-admin-doc-form.component.scss']
})
export class DaAdminDocFormComponent
implements OnInit {
    
    formGp: FormGroup;

    constructor(
        private daDocumentationService: DaDocumentationService
    ){}

    ngOnInit(): void{
        this.buildForm;
    }

    buildForm(): void {
        this.formGp = new FormBuilder().group({
            title: [null, Validators.required],
            content: [null, Validators.required]
        })
    }

    create(formValue: DaDocumentationForm): Observable<DaDocumentation> {
        return this.daDocumentationService.create(formValue);
    }

    update(formValue: DaDocumentationForm): Observable<DaDocumentation> {
        return this.daDocumentationService.update(formValue);
    }
}