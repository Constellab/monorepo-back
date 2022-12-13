import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlSearchHeaderActionsComponent} from './fl-search-header-actions.component';

describe('FlSearchHeaderActionsComponent', () => {
  let component: FlSearchHeaderActionsComponent;
  let fixture: ComponentFixture<FlSearchHeaderActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlSearchHeaderActionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlSearchHeaderActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
