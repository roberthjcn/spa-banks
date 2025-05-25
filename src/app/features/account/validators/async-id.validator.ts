import { AbstractControl, AsyncValidatorFn, ValidationErrors } from "@angular/forms";
import { Observable, catchError, debounceTime, map, of, switchMap } from "rxjs";
import { AccountService } from "../services/account.service";

export function asyncIdValidator(accountService: AccountService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        return of(control.value).pipe(
            debounceTime(300),
            switchMap((id: string) =>
                accountService.verifyAccountExist(id).pipe(
                    map((exists) => (exists ? { idExists: true } : null)),
                    catchError(() => of(null))
                )
            )
        );
    };
}