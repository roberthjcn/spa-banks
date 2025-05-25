import { Routes } from '@angular/router';
import { AccountFormComponent } from './features/account/components/account-form/account-form.component';
import { AccountComponent } from './features/account/pages/account/account.component';


export const routes: Routes = [
    {
        path: 'account-list',
        component: AccountComponent
    },
    {
        path: 'account-form',
        component: AccountFormComponent 
    },
    {
        path: 'account-form/:id',
        component: AccountFormComponent
    },
    { path: '', redirectTo: '/account-list', pathMatch: 'full' }
];
