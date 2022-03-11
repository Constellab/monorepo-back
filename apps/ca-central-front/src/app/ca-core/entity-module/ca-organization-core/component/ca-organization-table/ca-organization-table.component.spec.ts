import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaOrganizationTableComponent} from './ca-organization-table.component';

describe('CaOrganizationTableComponent', () => {
  let component: CaOrganizationTableComponent;
  let fixture: ComponentFixture<CaOrganizationTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaOrganizationTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaOrganizationTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
