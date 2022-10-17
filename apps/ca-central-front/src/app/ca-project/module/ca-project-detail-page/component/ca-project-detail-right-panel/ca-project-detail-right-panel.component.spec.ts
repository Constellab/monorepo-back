import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaProjectDetailRightPanelComponent} from './ca-project-detail-right-panel.component';

describe('CaProjectDetailRightPanelComponent', () => {
  let component: CaProjectDetailRightPanelComponent;
  let fixture: ComponentFixture<CaProjectDetailRightPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaProjectDetailRightPanelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaProjectDetailRightPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
