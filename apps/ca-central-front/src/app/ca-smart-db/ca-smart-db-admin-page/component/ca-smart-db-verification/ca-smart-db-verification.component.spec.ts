import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSmartDbVerificationComponent} from './ca-smart-db-verification.component';

describe('CaSmartDbVerificationComponent', () => {
  let component: CaSmartDbVerificationComponent;
  let fixture: ComponentFixture<CaSmartDbVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSmartDbVerificationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaSmartDbVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
