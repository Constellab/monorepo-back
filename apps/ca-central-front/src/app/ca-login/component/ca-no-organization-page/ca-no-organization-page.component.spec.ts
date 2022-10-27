import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaNoOrganizationPageComponent} from './ca-no-organization-page.component';

describe('CaNoOrganizationPageComponent', () => {
  let component: CaNoOrganizationPageComponent;
  let fixture: ComponentFixture<CaNoOrganizationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaNoOrganizationPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaNoOrganizationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
