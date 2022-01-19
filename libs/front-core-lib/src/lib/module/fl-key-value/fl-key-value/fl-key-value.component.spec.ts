import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlKeyValueComponent} from './fl-key-value.component';

describe('FlKeyValueComponent', () => {
  let component: FlKeyValueComponent;
  let fixture: ComponentFixture<FlKeyValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlKeyValueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlKeyValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
