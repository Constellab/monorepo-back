import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaOrganizationInvitListComponent} from './ca-organization-invit-list.component';

describe('CaOrganizationInvitListComponent', () => {
  let component: CaOrganizationInvitListComponent;
  let fixture: ComponentFixture<CaOrganizationInvitListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaOrganizationInvitListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaOrganizationInvitListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
