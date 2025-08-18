import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchDisplay } from './match-display';

describe('MatchDisplay', () => {
  let component: MatchDisplay;
  let fixture: ComponentFixture<MatchDisplay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchDisplay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchDisplay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
