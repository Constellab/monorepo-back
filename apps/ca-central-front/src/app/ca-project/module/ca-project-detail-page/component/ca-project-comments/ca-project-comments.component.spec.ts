import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaProjectCommentsComponent } from './ca-project-comments.component';

describe('CaProjectCommentsComponent', () => {
  let component: CaProjectCommentsComponent;
  let fixture: ComponentFixture<CaProjectCommentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaProjectCommentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaProjectCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
