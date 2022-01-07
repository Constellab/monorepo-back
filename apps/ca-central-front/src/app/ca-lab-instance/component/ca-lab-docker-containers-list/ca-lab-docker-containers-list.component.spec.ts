import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabDockerContainersListComponent} from './ca-lab-docker-containers-list.component';

describe('CaLabDockerContainersListComponent', () => {
  let component: CaLabDockerContainersListComponent;
  let fixture: ComponentFixture<CaLabDockerContainersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabDockerContainersListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabDockerContainersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
