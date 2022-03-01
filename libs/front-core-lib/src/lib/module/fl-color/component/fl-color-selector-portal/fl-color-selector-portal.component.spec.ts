import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlColorSelectorPortalComponent} from './fl-color-selector-portal.component';

describe('FlColorSelectorPortalComponent', () => {
  let component: FlColorSelectorPortalComponent;
  let fixture: ComponentFixture<FlColorSelectorPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlColorSelectorPortalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlColorSelectorPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
