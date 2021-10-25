import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabInstanceStatusDialogComponent} from './lab-instance-status-dialog.component';

describe('LabInstanceStatusDialogComponent', () => {
  let component: LabInstanceStatusDialogComponent;
  let fixture: ComponentFixture<LabInstanceStatusDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabInstanceStatusDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabInstanceStatusDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
