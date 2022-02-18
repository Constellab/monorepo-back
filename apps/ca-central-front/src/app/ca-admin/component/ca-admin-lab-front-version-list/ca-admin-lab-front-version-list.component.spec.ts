import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaAdminLabFrontVersionListComponent} from './ca-admin-lab-front-version-list.component';

describe('CaAdminLabFrontVersionListComponent', () => {
  let component: CaAdminLabFrontVersionListComponent;
  let fixture: ComponentFixture<CaAdminLabFrontVersionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaAdminLabFrontVersionListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaAdminLabFrontVersionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
