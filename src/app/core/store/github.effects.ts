import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { GithubService } from '../services/github.service';
import * as GithubActions from './github.actions';

@Injectable()
export class GithubEffects {
  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GithubActions.loadUsers),
      switchMap((action) =>
        this.githubService.getUsers(action.pageSize, action.since).pipe(
          map((users) => GithubActions.loadUsersSuccess({ users })),
          catchError((error) => of(GithubActions.loadUsersFailure({ error })))
        )
      )
    )
  );

  loadFollowers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GithubActions.loadFollowers),
      switchMap((action) =>
        this.githubService
          .getUserFollowers(action.username)
          .pipe(
            map((followers) =>
              GithubActions.loadFollowersSuccess({ followers })
            )
          )
      )
    )
  );

  loadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GithubActions.loadUser),
      switchMap((action) =>
        this.githubService
          .getUserDetails(action.username)
          .pipe(map((user) => GithubActions.loadUserSuccess({ user })))
      )
    )
  );

  loadRepositories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GithubActions.loadRepositories),
      switchMap((action) =>
        this.githubService
          .getUserRepos(action.username)
          .pipe(
            map((repositories) =>
              GithubActions.loadRepositoriesSuccess({ repositories })
            )
          )
      )
    )
  );

  searchUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GithubActions.search),
      switchMap((action) => {
        if (action.username && action.username.trim().length > 0) {
          return this.githubService
            .searchUsers(action.username)
            .pipe(
              map((u) => GithubActions.loadUsersSuccess({ users: u.items }))
            );
        } else {
          return EMPTY;
        }
      })
    )
  );

  constructor(
    private actions$: Actions,
    private githubService: GithubService
  ) {}
}
