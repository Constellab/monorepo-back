import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlDynamicFieldListComponent} from './fl-dynamic-field-list.component';

describe('FlDynamicFieldListComponent', () => {
  let component: FlDynamicFieldListComponent;
  let fixture: ComponentFixture<FlDynamicFieldListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlDynamicFieldListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlDynamicFieldListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
