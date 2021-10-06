import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlErrorTextComponent} from './fl-error-text.component';

describe('FlErrorTextComponent', () => {
  let component: FlErrorTextComponent;
  let fixture: ComponentFixture<FlErrorTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlErrorTextComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlErrorTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
