import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlTagInputComponent} from './fl-tag-input.component';

describe('FlTagInputComponent', () => {
  let component: FlTagInputComponent;
  let fixture: ComponentFixture<FlTagInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlTagInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlTagInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
