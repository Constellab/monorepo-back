import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlResizePortalFullscreenButtonComponent} from './fl-resize-portal-fullscreen-button.component';

describe('FlResizeFullscreenButtonComponent', () => {
  let component: FlResizePortalFullscreenButtonComponent;
  let fixture: ComponentFixture<FlResizePortalFullscreenButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlResizePortalFullscreenButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlResizePortalFullscreenButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
