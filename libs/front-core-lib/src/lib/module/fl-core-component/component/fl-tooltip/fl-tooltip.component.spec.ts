import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {FlTooltipComponent} from './fl-tooltip.component';

describe('LibTooltipComponent', () => {
  let component: FlTooltipComponent;
  let fixture: ComponentFixture<FlTooltipComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FlTooltipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
