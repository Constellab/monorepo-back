import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlDynamicFieldSelectComponent} from './fl-dynamic-field-select.component';

describe('FlDynamicFieldSelectComponent', () => {
  let component: FlDynamicFieldSelectComponent;
  let fixture: ComponentFixture<FlDynamicFieldSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlDynamicFieldSelectComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlDynamicFieldSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
