import { Location } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription, switchMap } from 'rxjs';
import { GitHubRepository } from 'src/app/core/models/repository';
import { User } from 'src/app/core/models/user';
import { ToastService } from 'src/app/core/services/toast.service';
import {
  loadFollowers,
  loadRepositories,
  loadUser,
} from 'src/app/core/store/github.actions';
import {
  selectGithubFollowers,
  selectGithubRepositories,
  selectGitubUser,
} from 'src/app/core/store/github.selector';
import { slideInAnimation } from 'src/app/layout/animations';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss'],
  animations: [slideInAnimation],
})
export class UserDetailsComponent implements OnInit, OnDestroy {
  user$ = new Observable<User>();
  followers$ = new Observable<User[]>();
  repositories$ = new Observable<GitHubRepository[]>();
  private routeParamSubscription: Subscription | undefined;
  animateState: string = '';
  activeTabIndex: number = 0;

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private toast: ToastService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.routeParamSubscription = this.route.paramMap
      .pipe(
        switchMap((params) => {
          const username = params.get('username');
          this.animateState = username!;
          return username ? [username] : [];
        })
      )
      .subscribe((username) => {
        if (username) {
          this.store.dispatch(loadUser({ username }));
          this.route.queryParams.subscribe((params) => {
            if (params['tab']) {
              this.activeTabIndex = parseInt(params['tab'], 10);
            }
            this.onTabChange(this.activeTabIndex);
          });
        } else {
          this.toast.error('Error loading user');
        }
      });

    this.user$ = this.store.select(selectGitubUser);
    this.followers$ = this.store.select(selectGithubFollowers);
    this.repositories$ = this.store.select(selectGithubRepositories);
  }

  showUserDetails(user: User) {
    this.router.navigate(['/user', user.login]);
  }

  onTabChange(tabIndex: number) {
    const username = this.animateState;
    tabIndex === 0
      ? this.store.dispatch(loadRepositories({ username }))
      : this.store.dispatch(loadFollowers({ username }));
    const url = this.location.path();
    const urlWithoutParams = url.split('?')[0];
    let currentParams = new HttpParams({ fromString: url.split('?')[1] });
    currentParams = currentParams.set('tab', tabIndex);
    const newUrl = urlWithoutParams + '?' + currentParams.toString();
    this.location.go(newUrl);
  }

  ngOnDestroy(): void {
    if (this.routeParamSubscription) {
      this.routeParamSubscription.unsubscribe();
    }
  }
}
