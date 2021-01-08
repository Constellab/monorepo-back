import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlChipComponent} from './fl-chip.component';

describe('ChipComponent', () => {
  let component: FlChipComponent;
  let fixture: ComponentFixture<FlChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlChipComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
