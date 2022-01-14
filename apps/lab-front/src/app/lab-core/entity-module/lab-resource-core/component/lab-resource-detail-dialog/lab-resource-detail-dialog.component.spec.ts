import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceDetailDialogComponent} from './lab-resource-detail-dialog.component';

describe('LabResourceViewDialogComponent', () => {
  let component: LabResourceDetailDialogComponent;
  let fixture: ComponentFixture<LabResourceDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceDetailDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourceDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
