import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSpaceInlineComponent} from './ca-space-inline.component';

describe('CaSpaceInlineComponent', () => {
  let component: CaSpaceInlineComponent;
  let fixture: ComponentFixture<CaSpaceInlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSpaceInlineComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaSpaceInlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
