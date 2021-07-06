import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlMenuDynamicPortalComponent} from './fl-menu-dynamic-portal.component';

describe('FlMenuDynamicPortalComponent', () => {
  let component: FlMenuDynamicPortalComponent;
  let fixture: ComponentFixture<FlMenuDynamicPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlMenuDynamicPortalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlMenuDynamicPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
