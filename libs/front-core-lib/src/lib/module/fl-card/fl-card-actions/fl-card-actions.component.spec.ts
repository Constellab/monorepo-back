import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {FlCardActionsComponent} from './fl-card-actions.component';

describe('LibCardActionsComponent', () => {
  let component: FlCardActionsComponent;
  let fixture: ComponentFixture<FlCardActionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FlCardActionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlCardActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
