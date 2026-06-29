import { expect, test } from '@playwright/test';

test('un visitante es redirigido al login y puede navegar al registro', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL(/login/);
  await expect(page.getByText('Bienvenido 👋').first()).toBeVisible();
  await expect(page.getByText('Iniciá sesión para acceder a tu catálogo')).toBeVisible();

  await page.getByText('Crear cuenta').click();
  await expect(page).toHaveURL(/signup/);
  await expect(page.getByText('Creá tu cuenta')).toBeVisible();

  await page.getByText('Iniciar sesión').click();
  await expect(page).toHaveURL(/login/);
  await expect(page.getByText('Bienvenido 👋').last()).toBeVisible();
});
