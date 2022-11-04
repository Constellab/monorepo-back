import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaExternalOrganizationLinkButtonComponent} from './ca-external-organization-link-button.component';

describe('CaExternalOrganizationLinkComponent', () => {
  let component: CaExternalOrganizationLinkButtonComponent;
  let fixture: ComponentFixture<CaExternalOrganizationLinkButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaExternalOrganizationLinkButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaExternalOrganizationLinkButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
