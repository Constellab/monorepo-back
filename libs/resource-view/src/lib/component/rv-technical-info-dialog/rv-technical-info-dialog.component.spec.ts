import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RvTechnicalInfoDialogComponent} from './rv-technical-info-dialog.component';

describe('LabTechnicalInfoPortalComponent', () => {
  let component: RvTechnicalInfoDialogComponent;
  let fixture: ComponentFixture<RvTechnicalInfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RvTechnicalInfoDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RvTechnicalInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
