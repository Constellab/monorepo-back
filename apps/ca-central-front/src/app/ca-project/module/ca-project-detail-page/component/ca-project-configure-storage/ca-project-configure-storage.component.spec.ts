import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaProjectConfigureStorageComponent} from './ca-project-configure-storage.component';

describe('CaProjectConfigureStorageComponent', () => {
  let component: CaProjectConfigureStorageComponent;
  let fixture: ComponentFixture<CaProjectConfigureStorageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaProjectConfigureStorageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaProjectConfigureStorageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
