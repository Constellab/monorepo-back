import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaAdminOrganizationsListComponent} from './ca-admin-organizations-list.component';

describe('CaAdminOrganizationsListComponent', () => {
  let component: CaAdminOrganizationsListComponent;
  let fixture: ComponentFixture<CaAdminOrganizationsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaAdminOrganizationsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaAdminOrganizationsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
