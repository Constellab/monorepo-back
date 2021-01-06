import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {CardActionsComponent} from './card-actions.component';

describe('LibCardActionsComponent', () => {
  let component: CardActionsComponent;
  let fixture: ComponentFixture<CardActionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CardActionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
