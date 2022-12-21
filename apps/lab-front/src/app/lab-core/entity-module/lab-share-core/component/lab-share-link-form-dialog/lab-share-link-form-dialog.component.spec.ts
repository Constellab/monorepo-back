import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabShareLinkFormDialogComponent} from './lab-share-link-form-dialog.component';

describe('LabShareLinkFormDialogComponent', () => {
  let component: LabShareLinkFormDialogComponent;
  let fixture: ComponentFixture<LabShareLinkFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabShareLinkFormDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabShareLinkFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
