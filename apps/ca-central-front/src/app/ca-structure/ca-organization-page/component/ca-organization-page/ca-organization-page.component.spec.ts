import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaOrganizationPageComponent} from './ca-organization-page.component';

describe('CaOrganizationPageComponent', () => {
  let component: CaOrganizationPageComponent;
  let fixture: ComponentFixture<CaOrganizationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaOrganizationPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaOrganizationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
