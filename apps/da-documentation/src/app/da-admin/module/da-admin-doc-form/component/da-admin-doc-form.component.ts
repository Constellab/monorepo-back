import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Observable} from 'rxjs';
import { Validators } from '@angular/forms';
import { DaDocumentation } from '../../../../da-core/da-model/da-entities/da-documentation.class';
import { DaDocumentationService } from '../../../../da-core/da-service/da-documentation.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'da-admin-doc-form',
    templateUrl: './da-admin-doc-form.component.html',
    styleUrls: ['./da-admin-doc-form.component.scss']
})
export class DaAdminDocFormComponent
implements OnInit {
    
    formGp: FormGroup<DaDocumentation>;
    isUpdate: boolean = false;

    constructor(
        private daDocumentationService: DaDocumentationService,
        private activatedRoute: ActivatedRoute
    ){}

    ngOnInit(): void{
        this.buildForm();
        this.activatedRoute.params.subscribe(params => {
            if(params['id']) this.setFormGroupValue(params['id']);
        });
    }

    buildForm(): void {
        this.formGp = new FormBuilder().group({
            id: [null],
            title: [null, Validators.required],
            content: [null, Validators.required]
        })
    }

    submit(): void {
        if(this.isUpdate)
            this.update(this.formGp.value).subscribe();
        else
            this.create(this.formGp.value).subscribe();
    }

    create(formValue: DaDocumentation): Observable<DaDocumentation> {
        return this.daDocumentationService.create(formValue);
    }

    update(formValue: DaDocumentation): Observable<DaDocumentation> {
        return this.daDocumentationService.update(formValue);
    }

    private getById(id: string): Observable<DaDocumentation> {
        return this.daDocumentationService.getById(id);
    }

    private setFormGroupValue(id: string): void{
        this.getById(id).subscribe(doc => {
            this.formGp.patchValue(doc);
            this.isUpdate = true;
        })
    }
}