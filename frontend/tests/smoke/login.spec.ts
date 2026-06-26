import {test, expect} from "@playwright/test";

test('login page has login button', async ({page})=>{
    
    await page.goto('/')

    await expect(page).toHaveTitle(/appointmentpro/i)

    await expect(page.getByRole("button", {name: /sign in/i})).toBeVisible()

    await page.getByRole("button", {name: /sign in/i}).click()

    await expect(page).toHaveTitle(/Sign in to My Application/i)
}
)