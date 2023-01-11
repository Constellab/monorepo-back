import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlFormulaComponent} from './fl-formula.component';

describe('FlFormulaComponent', () => {
  let component: FlFormulaComponent;
  let fixture: ComponentFixture<FlFormulaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlFormulaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlFormulaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
