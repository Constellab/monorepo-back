import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaOrganizationInvitTableComponent} from './ca-organization-invit-table.component';

describe('CaOrganizationInvitTableComponent', () => {
  let component: CaOrganizationInvitTableComponent;
  let fixture: ComponentFixture<CaOrganizationInvitTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaOrganizationInvitTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaOrganizationInvitTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
