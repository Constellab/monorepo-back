import {ComponentFixture, TestBed} from '@angular/core/testing';

import {StatusHistoryCardComponent} from './status-history-card.component';

describe('StatusHistoryCardComponent', () => {
  let component: StatusHistoryCardComponent;
  let fixture: ComponentFixture<StatusHistoryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatusHistoryCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusHistoryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
