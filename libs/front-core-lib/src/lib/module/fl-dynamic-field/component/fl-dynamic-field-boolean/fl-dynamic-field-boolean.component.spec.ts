import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlDynamicFieldBooleanComponent} from './fl-dynamic-field-boolean.component';

describe('FlDynamicFieldBooleanComponent', () => {
  let component: FlDynamicFieldBooleanComponent;
  let fixture: ComponentFixture<FlDynamicFieldBooleanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlDynamicFieldBooleanComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlDynamicFieldBooleanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
