import { AfterViewChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { slideInAnimation } from './layout/animations';
import { Observable, combineLatest, map } from 'rxjs';
import { Store, select } from '@ngrx/store';
import {
  selectFollowersLoading,
  selectRepositoriesLoading,
  selectUserLoading,
  selectUsersLoading
} from './core/store/github.selector';
import { UntypedFormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [slideInAnimation]
})
export class AppComponent implements OnInit, AfterViewChecked{

  isLoading$: Observable<boolean>;
  title = 'Githubitat';
  toggleControl = new UntypedFormControl(false);
  isDarkSide : boolean = false;

  constructor(private store: Store,
    private cdRef: ChangeDetectorRef) {
    this.isLoading$ = combineLatest([
      this.store.pipe(select(selectUsersLoading)),
      this.store.pipe(select(selectUserLoading)),
      this.store.pipe(select(selectRepositoriesLoading)),
      this.store.pipe(select(selectFollowersLoading)),
    ]).pipe(
      map(([
        loadingUsers,
        loadingUser,
        loadingRepositories,
        loadingFollowers]) => loadingUsers || loadingUser || loadingRepositories || loadingFollowers)
    );
  }
  ngOnInit(): void {
    this.toggleControl.valueChanges.subscribe(isDark => {
      this.isDarkSide = isDark;
   });
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }
}
