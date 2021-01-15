import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlStatusChipComponent} from './fl-status-chip.component';

describe('StatusChipComponent', () => {
  let component: FlStatusChipComponent;
  let fixture: ComponentFixture<FlStatusChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlStatusChipComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlStatusChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
