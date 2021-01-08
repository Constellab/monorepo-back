import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {FlRoundImageComponent} from './fl-round-image.component';

describe('LibRoundImageComponent', () => {
  let component: FlRoundImageComponent;
  let fixture: ComponentFixture<FlRoundImageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FlRoundImageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlRoundImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
