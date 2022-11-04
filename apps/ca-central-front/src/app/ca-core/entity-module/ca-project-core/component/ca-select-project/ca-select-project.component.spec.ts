import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSelectProjectComponent} from './ca-select-project.component';

describe('CaSelectProjectDialogComponent', () => {
  let component: CaSelectProjectComponent;
  let fixture: ComponentFixture<CaSelectProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSelectProjectComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaSelectProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
