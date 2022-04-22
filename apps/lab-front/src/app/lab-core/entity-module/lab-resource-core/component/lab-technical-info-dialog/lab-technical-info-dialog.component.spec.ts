import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabTechnicalInfoDialogComponent} from './lab-technical-info-dialog.component';

describe('LabTechnicalInfoPortalComponent', () => {
  let component: LabTechnicalInfoDialogComponent;
  let fixture: ComponentFixture<LabTechnicalInfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabTechnicalInfoDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabTechnicalInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
