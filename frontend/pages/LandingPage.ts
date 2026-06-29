import {type Page,expect} from "@playwright/test";

export class LandingPage{
    url = 'http://localhost:8080';
    page : Page;
    constructor(page:Page){
        this.page = page
    };
    async open(){
       await this.page.goto(this.url)
    };

    async expectLoaded(){
        await expect(this.page).toHaveTitle(/appointmentpro/i)
        await expect(this.page.getByRole('button',{name:/sign in/i})).toBeVisible()
    };

    async clickSignIn(){
        await this.page.getByRole('button',{name:/sign in/i}).click()
    }

    async expectSignInDialogOpen(){
        await expect(this.page.getByRole('heading',{name:/Sign in to My Application/i})).toBeVisible()
        await expect(this.page.getByRole('button',{name:/sign in with apple/i})).toBeVisible();
    }

    async expectCreateAccountDialogOpen(){
        await expect(this.page.getByRole('heading',{name:/create your account/i})).toBeVisible();
        await expect(this.page.getByRole('textbox',{name: /email address/i})).toBeVisible();
        await expect(this.page.getByRole('textbox', {name:/password/i})).toBeVisible();

    }
}