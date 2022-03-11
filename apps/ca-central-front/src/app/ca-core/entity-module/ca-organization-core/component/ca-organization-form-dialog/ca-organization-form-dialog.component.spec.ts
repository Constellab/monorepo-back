import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaOrganizationFormDialogComponent} from './ca-organization-form-dialog.component';

describe('CaOrganizationFormDialogComponent', () => {
  let component: CaOrganizationFormDialogComponent;
  let fixture: ComponentFixture<CaOrganizationFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaOrganizationFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaOrganizationFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
