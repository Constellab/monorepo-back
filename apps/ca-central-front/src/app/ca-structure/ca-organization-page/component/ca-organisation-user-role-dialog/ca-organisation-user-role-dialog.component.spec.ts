import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaOrganisationUserRoleDialogComponent} from './ca-organisation-user-role-dialog.component';

describe('CaOrganisationUserRoleDialogComponent', () => {
  let component: CaOrganisationUserRoleDialogComponent;
  let fixture: ComponentFixture<CaOrganisationUserRoleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaOrganisationUserRoleDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaOrganisationUserRoleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
