import {ComponentFixture, TestBed} from '@angular/core/testing';

import {Ha404Component} from './ha404.component';

describe('Ha404Component', () => {
  let component: Ha404Component;
  let fixture: ComponentFixture<Ha404Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Ha404Component]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Ha404Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
