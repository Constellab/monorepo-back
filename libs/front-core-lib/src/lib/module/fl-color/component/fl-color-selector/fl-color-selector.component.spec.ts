import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlColorSelectorComponent} from './fl-color-selector.component';

describe('FlColorSelectorComponent', () => {
  let component: FlColorSelectorComponent;
  let fixture: ComponentFixture<FlColorSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlColorSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlColorSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
