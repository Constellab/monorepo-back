import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSmartDbCardComponent} from './ca-smart-db-card.component';

describe('CaSmartDbCardComponent', () => {
  let component: CaSmartDbCardComponent;
  let fixture: ComponentFixture<CaSmartDbCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSmartDbCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaSmartDbCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
