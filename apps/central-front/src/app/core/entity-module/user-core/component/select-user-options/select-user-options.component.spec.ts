import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SelectUserOptionsComponent} from './select-user-options.component';

describe('SelectUserOptionsComponent', () => {
  let component: SelectUserOptionsComponent;
  let fixture: ComponentFixture<SelectUserOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectUserOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectUserOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
