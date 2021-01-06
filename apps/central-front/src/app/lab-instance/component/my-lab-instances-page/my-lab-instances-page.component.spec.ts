import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MyLabInstancesPageComponent} from './my-lab-instances-page.component';

describe('MyLabInstancesPageComponent', () => {
  let component: MyLabInstancesPageComponent;
  let fixture: ComponentFixture<MyLabInstancesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyLabInstancesPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyLabInstancesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
