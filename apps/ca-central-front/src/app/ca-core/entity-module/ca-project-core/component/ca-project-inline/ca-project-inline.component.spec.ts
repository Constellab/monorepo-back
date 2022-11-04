import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaProjectInlineComponent} from './ca-project-inline.component';

describe('CaProjectInlineComponent', () => {
  let component: CaProjectInlineComponent;
  let fixture: ComponentFixture<CaProjectInlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaProjectInlineComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaProjectInlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
