import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaRequestNewLicensesComponent} from './ca-request-new-licenses.component';

describe('CaRequestNewLicensesComponent', () => {
  let component: CaRequestNewLicensesComponent;
  let fixture: ComponentFixture<CaRequestNewLicensesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaRequestNewLicensesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaRequestNewLicensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
