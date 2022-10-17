import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaProjectDescriptionComponent} from './ca-project-description.component';

describe('CaProjectDescriptionComponent', () => {
  let component: CaProjectDescriptionComponent;
  let fixture: ComponentFixture<CaProjectDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaProjectDescriptionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaProjectDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
