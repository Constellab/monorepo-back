import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxProjectSelectOptionsComponent} from './biox-project-select-options.component';

describe('BioxProjectSelectOptionsComponent', () => {
  let component: BioxProjectSelectOptionsComponent;
  let fixture: ComponentFixture<BioxProjectSelectOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxProjectSelectOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxProjectSelectOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
