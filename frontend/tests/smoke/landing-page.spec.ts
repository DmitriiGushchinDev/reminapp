import {test} from "@playwright/test";
import {LandingPage} from "../../pages/LandingPage.ts"

test('landing page loads', async ({page})=>{
    
    const landingPage = new LandingPage(page)
    await landingPage.open()
    await landingPage.expectLoaded()

}
);

test('User can open the sign in dialog', async ({page})=>{
    const landingPage = new LandingPage(page);
    await landingPage.open();
    await landingPage.expectLoaded();
    await landingPage.clickSignIn()
    await landingPage.expectSignInDialogOpen()
}
)