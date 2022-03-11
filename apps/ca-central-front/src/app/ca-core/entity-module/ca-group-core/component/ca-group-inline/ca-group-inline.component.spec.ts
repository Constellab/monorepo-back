import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaGroupInlineComponent} from './ca-group-inline.component';

describe('CaGroupInlineComponent', () => {
  let component: CaGroupInlineComponent;
  let fixture: ComponentFixture<CaGroupInlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaGroupInlineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaGroupInlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
