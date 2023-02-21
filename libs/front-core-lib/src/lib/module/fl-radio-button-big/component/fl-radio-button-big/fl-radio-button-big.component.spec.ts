import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlRadioButtonBigComponent} from './fl-radio-button-big.component';

describe('FlRadioButtonBigComponent', () => {
  let component: FlRadioButtonBigComponent;
  let fixture: ComponentFixture<FlRadioButtonBigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlRadioButtonBigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlRadioButtonBigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
