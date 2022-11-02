import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSelectOrganizationOptionsComponent} from './ca-select-organization-options.component';

describe('CaSelectOrganizationOptionsComponent', () => {
  let component: CaSelectOrganizationOptionsComponent;
  let fixture: ComponentFixture<CaSelectOrganizationOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSelectOrganizationOptionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaSelectOrganizationOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
