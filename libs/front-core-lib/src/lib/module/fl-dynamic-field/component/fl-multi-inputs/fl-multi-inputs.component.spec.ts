import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlMultiInputsComponent} from './fl-multi-inputs.component';

describe('FlMultiInputsComponent', () => {
  let component: FlMultiInputsComponent;
  let fixture: ComponentFixture<FlMultiInputsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlMultiInputsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlMultiInputsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
