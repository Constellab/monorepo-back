import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxStudySelectOptionsComponent} from './biox-study-select-options.component';

describe('BioxStudySelectOptionsComponent', () => {
  let component: BioxStudySelectOptionsComponent;
  let fixture: ComponentFixture<BioxStudySelectOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxStudySelectOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxStudySelectOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
