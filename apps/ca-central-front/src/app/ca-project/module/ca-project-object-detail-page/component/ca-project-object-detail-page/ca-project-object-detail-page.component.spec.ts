import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaProjectObjectDetailPageComponent} from './ca-project-object-detail-page.component';

describe('CaProjectObjectLayoutComponent', () => {
  let component: CaProjectObjectDetailPageComponent;
  let fixture: ComponentFixture<CaProjectObjectDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaProjectObjectDetailPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaProjectObjectDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
