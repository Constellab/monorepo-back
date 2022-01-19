import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlKeyComponent} from './fl-key.component';

describe('FlKeyComponent', () => {
  let component: FlKeyComponent;
  let fixture: ComponentFixture<FlKeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlKeyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlKeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
