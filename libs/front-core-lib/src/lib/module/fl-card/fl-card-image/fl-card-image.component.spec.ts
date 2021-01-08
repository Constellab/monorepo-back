import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {FlCardImageComponent} from './fl-card-image.component';

describe('LibCardImageComponent', () => {
  let component: FlCardImageComponent;
  let fixture: ComponentFixture<FlCardImageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FlCardImageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlCardImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
