import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaMyTeamsPageComponent} from './ca-my-teams-page.component';

describe('CaMyGroupsPageComponent', () => {
  let component: CaMyTeamsPageComponent;
  let fixture: ComponentFixture<CaMyTeamsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaMyTeamsPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaMyTeamsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
