import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaProjectChildrenComponent} from './ca-project-children.component';

describe('CaProjectChlidrenComponent', () => {
  let component: CaProjectChildrenComponent;
  let fixture: ComponentFixture<CaProjectChildrenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaProjectChildrenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaProjectChildrenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
