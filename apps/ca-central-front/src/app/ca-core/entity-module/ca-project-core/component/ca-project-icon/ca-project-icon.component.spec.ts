import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaProjectIconComponent} from './ca-project-icon.component';

describe('CaProjectIconComponent', () => {
  let component: CaProjectIconComponent;
  let fixture: ComponentFixture<CaProjectIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaProjectIconComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaProjectIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
