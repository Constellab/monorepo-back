import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaCurrentOrganizationDetailComponent} from './ca-current-organization-detail.component';

describe('CaOrganizationDetailComponent', () => {
  let component: CaCurrentOrganizationDetailComponent;
  let fixture: ComponentFixture<CaCurrentOrganizationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaCurrentOrganizationDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaCurrentOrganizationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
