import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceStatusDialogComponent} from './ca-lab-instance-status-dialog.component';

describe('LabInstanceStatusDialogComponent', () => {
  let component: CaLabInstanceStatusDialogComponent;
  let fixture: ComponentFixture<CaLabInstanceStatusDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceStatusDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabInstanceStatusDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
