import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaProjectCardComponent} from './ca-project-card.component';

describe('ProjectCardComponent', () => {
  let component: CaProjectCardComponent;
  let fixture: ComponentFixture<CaProjectCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaProjectCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaProjectCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
