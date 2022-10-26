import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaMyOrganizationsPortalComponent} from './ca-my-organizations-portal.component';

describe('CaMyOrganizationsPortalComponent', () => {
  let component: CaMyOrganizationsPortalComponent;
  let fixture: ComponentFixture<CaMyOrganizationsPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaMyOrganizationsPortalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaMyOrganizationsPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
