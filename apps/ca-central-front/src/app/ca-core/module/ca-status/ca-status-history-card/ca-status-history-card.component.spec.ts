import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaStatusHistoryCardComponent} from './ca-status-history-card.component';

describe('StatusHistoryCardComponent', () => {
  let component: CaStatusHistoryCardComponent;
  let fixture: ComponentFixture<CaStatusHistoryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaStatusHistoryCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaStatusHistoryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
