import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlResizeFullscreenButtonComponent} from './fl-resize-fullscreen-button.component';

describe('FlResizeFullscreenButtonComponent', () => {
  let component: FlResizeFullscreenButtonComponent;
  let fixture: ComponentFixture<FlResizeFullscreenButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlResizeFullscreenButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlResizeFullscreenButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
