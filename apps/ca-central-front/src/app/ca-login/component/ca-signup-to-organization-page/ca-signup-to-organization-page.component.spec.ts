import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSignupToOrganizationPageComponent} from './ca-signup-to-organization-page.component';

describe('CaJoinOrganizationPageComponent', () => {
  let component: CaSignupToOrganizationPageComponent;
  let fixture: ComponentFixture<CaSignupToOrganizationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSignupToOrganizationPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaSignupToOrganizationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
