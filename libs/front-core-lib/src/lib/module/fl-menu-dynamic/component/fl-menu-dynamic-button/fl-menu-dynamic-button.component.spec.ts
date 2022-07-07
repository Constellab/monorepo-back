import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlMenuDynamicButtonComponent} from './fl-menu-dynamic-button.component';

describe('FlDynamicMenuButtonComponent', () => {
  let component: FlMenuDynamicButtonComponent;
  let fixture: ComponentFixture<FlMenuDynamicButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlMenuDynamicButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlMenuDynamicButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
