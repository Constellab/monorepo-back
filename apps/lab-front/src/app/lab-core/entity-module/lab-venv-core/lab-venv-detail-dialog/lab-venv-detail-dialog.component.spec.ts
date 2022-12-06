import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabVenvDetailDialogComponent} from './lab-venv-detail-dialog.component';

describe('LabVenvDetailDialogComponent', () => {
  let component: LabVenvDetailDialogComponent;
  let fixture: ComponentFixture<LabVenvDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabVenvDetailDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabVenvDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
