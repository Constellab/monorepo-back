import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {FlCardComponent} from './fl-card.component';

describe('LibCardComponent', () => {
  let component: FlCardComponent;
  let fixture: ComponentFixture<FlCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FlCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
