import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlMenuDynamicComponent} from './fl-menu-dynamic.component';

describe('FlMenuDynamicComponent', () => {
  let component: FlMenuDynamicComponent;
  let fixture: ComponentFixture<FlMenuDynamicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlMenuDynamicComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlMenuDynamicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
