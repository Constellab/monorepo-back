import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabDockerContainerLogsComponent} from './ca-lab-docker-container-logs.component';

describe('CaLabDockerContainerLogsComponent', () => {
  let component: CaLabDockerContainerLogsComponent;
  let fixture: ComponentFixture<CaLabDockerContainerLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabDockerContainerLogsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabDockerContainerLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
