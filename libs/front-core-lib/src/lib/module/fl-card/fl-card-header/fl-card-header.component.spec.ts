import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {FlCardHeaderComponent} from './fl-card-header.component';

describe('LibCardHeaderComponent', () => {
  let component: FlCardHeaderComponent;
  let fixture: ComponentFixture<FlCardHeaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FlCardHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlCardHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
