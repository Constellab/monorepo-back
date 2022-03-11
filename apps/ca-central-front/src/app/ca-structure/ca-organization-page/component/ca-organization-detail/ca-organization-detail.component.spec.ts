import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaOrganizationDetailComponent} from './ca-organization-detail.component';

describe('CaOrganizationDetailComponent', () => {
  let component: CaOrganizationDetailComponent;
  let fixture: ComponentFixture<CaOrganizationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaOrganizationDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaOrganizationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
