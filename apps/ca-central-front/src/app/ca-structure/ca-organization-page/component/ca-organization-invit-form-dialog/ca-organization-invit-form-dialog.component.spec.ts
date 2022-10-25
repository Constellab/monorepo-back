import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaOrganizationInvitFormDialogComponent} from './ca-organization-invit-form-dialog.component';

describe('CaOrganizationInvitFormDialogComponent', () => {
  let component: CaOrganizationInvitFormDialogComponent;
  let fixture: ComponentFixture<CaOrganizationInvitFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaOrganizationInvitFormDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaOrganizationInvitFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
