import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
      <app-header></app-header>
      <router-outlet></router-outlet>
      <app-footer></app-footer>
    `,
  styles: [`
      :host{
        display:flex;
        flex-flow: column nowrap;
        justify-content: space-between;
        align-items: center;
      }
    `]
})
export class AppComponent { }