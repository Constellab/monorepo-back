import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaCurrentOrganizationPageComponent} from './ca-current-organization-page.component';

describe('CaOrganizationPageComponent', () => {
  let component: CaCurrentOrganizationPageComponent;
  let fixture: ComponentFixture<CaCurrentOrganizationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaCurrentOrganizationPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaCurrentOrganizationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
