import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PrWorkflowPortActionPortalComponent} from './pr-workflow-port-action-portal.component';

describe('PrWorkflowPortActionPortalComponent', () => {
  let component: PrWorkflowPortActionPortalComponent;
  let fixture: ComponentFixture<PrWorkflowPortActionPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrWorkflowPortActionPortalComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PrWorkflowPortActionPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
