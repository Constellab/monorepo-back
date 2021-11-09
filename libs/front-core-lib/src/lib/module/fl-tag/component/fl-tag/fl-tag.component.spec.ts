import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlTagComponent} from './fl-tag.component';

describe('FlTagComponent', () => {
  let component: FlTagComponent;
  let fixture: ComponentFixture<FlTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlTagComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
