import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSmartDbManagementComponent} from './ca-smart-db-management.component';

describe('CaSmartDbManagementComponent', () => {
  let component: CaSmartDbManagementComponent;
  let fixture: ComponentFixture<CaSmartDbManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSmartDbManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaSmartDbManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
