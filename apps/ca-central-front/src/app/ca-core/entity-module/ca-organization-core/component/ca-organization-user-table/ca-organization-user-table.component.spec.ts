import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaOrganizationUserTableComponent} from './ca-organization-user-table.component';

describe('CaOrganizationUserTableComponent', () => {
  let component: CaOrganizationUserTableComponent;
  let fixture: ComponentFixture<CaOrganizationUserTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaOrganizationUserTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaOrganizationUserTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
