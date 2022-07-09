import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import {
  Select,
  Store,
  Action,
  Actions,
  ActionCompletion,
  ofAction,
  ofActionDispatched,
  ofActionSuccessful,
  ofActionErrored,
  ofActionCanceled,
  ofActionCompleted,
} from '@ngxs/store';
import { Observable, takeUntil, Subject } from 'rxjs';
import { Item } from 'src/app/models/item';
import { AddItem, RemoveItem } from 'src/app/state/items.actions';
import { ItemsState } from 'src/app/state/items.state';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit, OnDestroy {
  @Select(ItemsState.getAllItems) allItems$: Observable<Item[]> | undefined;
  loadingItems: boolean[] = [];
  item = '';

  private horizontalPosition: MatSnackBarHorizontalPosition = 'start';
  private verticalPosition: MatSnackBarVerticalPosition = 'top';
  private unSubscribe = new Subject<void>();

  constructor(
    private store: Store,
    private actions$: Actions,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.actions$
      .pipe(ofActionCompleted(AddItem, RemoveItem), takeUntil(this.unSubscribe))
      .subscribe((data: ActionCompletion) => {
        if (data.result.successful) {
          if (data.action instanceof RemoveItem) {
            this._snackBar.open('Item has been removed', 'Close', {
              horizontalPosition: this.horizontalPosition,
              verticalPosition: this.verticalPosition,
            });
          } else if (data.action instanceof AddItem) {
            this._snackBar.open(`${data.action.payload.name} added`, 'Close', {
              horizontalPosition: this.horizontalPosition,
              verticalPosition: this.verticalPosition,
            });
          }
        } else if (data.result.error) {
          this._snackBar.open('An error occured! Please try again!', 'Close', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
          });
        }
        this.loadingItems.pop();
      });
  }

  addItem(itemName: string): void {
    this.loadingItems.push(true);

    this.store.dispatch(new AddItem(new Item(itemName)));
  }

  removeItem(id: number): void {
    this.store.dispatch(new RemoveItem(id));
  }

  ngOnDestroy(): void {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }
}
