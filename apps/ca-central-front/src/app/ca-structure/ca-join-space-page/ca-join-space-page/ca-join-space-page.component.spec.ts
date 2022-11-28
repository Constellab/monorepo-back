import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaJoinSpacePageComponent} from './ca-join-space-page.component';

describe('CaJoinSpacePageComponent', () => {
  let component: CaJoinSpacePageComponent;
  let fixture: ComponentFixture<CaJoinSpacePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaJoinSpacePageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaJoinSpacePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
