import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SelectLabOptionsComponent} from './select-lab-options.component';

describe('SelectLabOptionsComponent', () => {
  let component: SelectLabOptionsComponent;
  let fixture: ComponentFixture<SelectLabOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectLabOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectLabOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
