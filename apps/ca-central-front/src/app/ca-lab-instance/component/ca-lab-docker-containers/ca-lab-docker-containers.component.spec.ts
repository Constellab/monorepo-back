import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabDockerContainersComponent} from './ca-lab-docker-containers.component';

describe('CaLabDockerContainersComponent', () => {
  let component: CaLabDockerContainersComponent;
  let fixture: ComponentFixture<CaLabDockerContainersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabDockerContainersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabDockerContainersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
