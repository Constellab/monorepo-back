import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaMyProjectsPageComponent} from './ca-my-projects-page.component';

describe('MyProjectsPageComponent', () => {
  let component: CaMyProjectsPageComponent;
  let fixture: ComponentFixture<CaMyProjectsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaMyProjectsPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaMyProjectsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
