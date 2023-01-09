import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlDynamicFieldTextareaComponent} from './fl-dynamic-field-textarea.component';

describe('FlDynamicFieldTextareaComponent', () => {
  let component: FlDynamicFieldTextareaComponent;
  let fixture: ComponentFixture<FlDynamicFieldTextareaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlDynamicFieldTextareaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlDynamicFieldTextareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
