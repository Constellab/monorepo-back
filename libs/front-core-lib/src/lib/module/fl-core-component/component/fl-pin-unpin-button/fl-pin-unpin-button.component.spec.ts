import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlPinUnpinButtonComponent} from './fl-pin-unpin-button.component';

describe('FlPinUnpinComponent', () => {
  let component: FlPinUnpinButtonComponent;
  let fixture: ComponentFixture<FlPinUnpinButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlPinUnpinButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlPinUnpinButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
