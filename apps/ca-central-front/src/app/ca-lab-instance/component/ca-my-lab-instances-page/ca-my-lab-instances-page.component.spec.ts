import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaMyLabInstancesPageComponent} from './ca-my-lab-instances-page.component';

describe('MyLabInstancesPageComponent', () => {
  let component: CaMyLabInstancesPageComponent;
  let fixture: ComponentFixture<CaMyLabInstancesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaMyLabInstancesPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaMyLabInstancesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
