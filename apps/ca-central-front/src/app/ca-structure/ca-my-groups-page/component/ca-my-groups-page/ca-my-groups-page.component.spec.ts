import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaMyGroupsPageComponent} from './ca-my-groups-page.component';

describe('CaMyGroupsPageComponent', () => {
  let component: CaMyGroupsPageComponent;
  let fixture: ComponentFixture<CaMyGroupsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaMyGroupsPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaMyGroupsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
