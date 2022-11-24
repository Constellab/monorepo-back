import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlDynamicAbstractFormComponent} from './fl-dynamic-abstract-form.component';

describe('FlDynamicAbstractFormComponent', () => {
  let component: FlDynamicAbstractFormComponent;
  let fixture: ComponentFixture<FlDynamicAbstractFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlDynamicAbstractFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlDynamicAbstractFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
