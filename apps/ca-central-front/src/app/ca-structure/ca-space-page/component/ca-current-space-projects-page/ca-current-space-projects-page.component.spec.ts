import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaCurrentSpaceProjectsPageComponent} from './ca-current-space-projects-page.component';

describe('CaCurrentSpaceProjectsPageComponent', () => {
  let component: CaCurrentSpaceProjectsPageComponent;
  let fixture: ComponentFixture<CaCurrentSpaceProjectsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaCurrentSpaceProjectsPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaCurrentSpaceProjectsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
