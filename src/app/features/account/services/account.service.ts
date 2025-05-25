import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { ErrorHandlerService } from './error-handler.service';
import { Account } from '../interfaces/account.interface';
import { environment } from '../environments/environment';



interface ApiResponse {
  data: Account[];
}

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private apiUrl = `${environment.apiBaseUrl}/products`;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  verifyAccountExist(idAccount: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/verification/${idAccount}`)
      .pipe(catchError(this.errorHandler.handleError));
  }

  getAccounts(): Observable<Account[]> {
    return this.http.get<ApiResponse>(this.apiUrl)
      .pipe(
        catchError(this.errorHandler.handleError),
        map((response: ApiResponse) => response.data)
      );
  }

  addAccount(account: Account): Observable<Account> {
    return this.http.post<Account>(this.apiUrl, account)
      .pipe(catchError(this.errorHandler.handleError));
  }

  editAccount(idAccount: string, account: Account): Observable<Account> {
    return this.http.put<Account>(`${this.apiUrl}/${idAccount}`, account)
      .pipe(catchError(this.errorHandler.handleError));
  }

  deleteAccount(idAccount: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${idAccount}`)
      .pipe(catchError(this.errorHandler.handleError));
  }


}
