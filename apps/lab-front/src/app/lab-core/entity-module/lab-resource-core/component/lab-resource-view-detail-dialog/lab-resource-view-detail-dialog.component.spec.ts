import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceViewDetailDialogComponent} from './lab-resource-view-detail-dialog.component';

describe('LabResourceViewDetailDialogComponent', () => {
  let component: LabResourceViewDetailDialogComponent;
  let fixture: ComponentFixture<LabResourceViewDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceViewDetailDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabResourceViewDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
