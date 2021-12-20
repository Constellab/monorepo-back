import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DaProjectCardComponent} from './da-project-card.component';

describe('ProjectCardComponent', () => {
  let component: DaProjectCardComponent;
  let fixture: ComponentFixture<DaProjectCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DaProjectCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DaProjectCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
