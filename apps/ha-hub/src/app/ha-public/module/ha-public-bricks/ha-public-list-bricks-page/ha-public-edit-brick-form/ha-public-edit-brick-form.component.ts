import {Component, Input, OnInit} from '@angular/core';
import {HaBrick} from '../../../../../ha-core/ha-model/ha-entities/ha-brick.class';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {HaBrickService} from '../../../../../ha-core/ha-service/ha-brick.service';
import {Route, Router} from '@angular/router';

@Component({
  selector: 'ha-public-edit-brick-form',
  templateUrl: './ha-public-edit-brick-form.component.html',
  styleUrls: ['./ha-public-edit-brick-form.component.scss']
})
export class HaPublicEditBrickFormComponent implements OnInit {

  @Input()
  brick: HaBrick;

  formGp: FormGroup<Partial<HaBrick>>;

  isLoading: boolean;

  constructor(
    private brickService: HaBrickService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm(): void {
    this.formGp = new FormBuilder().group({
      id: [null],
      name: [null, Validators.required],
      description: [null, Validators.required]
    });
  }

  submit(): void {
    this.isLoading = true;
    const formValue: Partial<HaBrick> = this.formGp.value;
    if (formValue.id) {
      //update
    } else {
      this.brickService.create(formValue).subscribe((brick) => {
        this.isLoading = false;
        this.router.navigateByUrl('/bricks/' + brick.name);
      });
    }

  }

}
