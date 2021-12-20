import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaAdminServerInfoListComponent} from './ca-admin-server-info-list.component';

describe('AdminServerInfoListComponent', () => {
  let component: CaAdminServerInfoListComponent;
  let fixture: ComponentFixture<CaAdminServerInfoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaAdminServerInfoListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaAdminServerInfoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
