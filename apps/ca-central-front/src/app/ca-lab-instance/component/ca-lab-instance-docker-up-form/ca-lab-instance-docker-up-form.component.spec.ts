import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceDockerUpFormComponent} from './ca-lab-instance-docker-up-form.component';

describe('CaLabInstanceDockerUpFormComponent', () => {
  let component: CaLabInstanceDockerUpFormComponent;
  let fixture: ComponentFixture<CaLabInstanceDockerUpFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceDockerUpFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabInstanceDockerUpFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
