import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabLogCompleteInfoDialogComponent} from './lab-log-complete-info-dialog.component';

describe('LabLogCompleteInfoDialogComponent', () => {
  let component: LabLogCompleteInfoDialogComponent;
  let fixture: ComponentFixture<LabLogCompleteInfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabLogCompleteInfoDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabLogCompleteInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
