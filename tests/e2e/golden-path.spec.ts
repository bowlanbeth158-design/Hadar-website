// ─────────────────────────────────────────────────────────────────────────────
// E2E — golden paths critiques.
//
// Couvre les 3 parcours utilisateur les plus importants :
//   1. Visiteur peut accéder à la home et faire une recherche
//   2. Inscription d'un nouveau compte (auto-login)
//   3. Soumission d'un signalement après vérification email
//
// Note : ces tests dépendent d'une DB Postgres + Redis dispo. La
// migration init doit être appliquée. Voir docs/deployment.md.
// ─────────────────────────────────────────────────────────────────────────────

import { test, expect } from '@playwright/test';

const TS = Date.now();

test('home loads and shows search', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Hadar/);
  // Le hero contient une barre de recherche.
  const searchInput = page
    .locator('form[role="search"] input[name="q"]')
    .first();
  await expect(searchInput).toBeVisible();
});

test('signup creates an account and auto-logs-in', async ({ page }) => {
  const email = `e2e-${TS}-signup@hadar-test.local`;
  const password = 'Hadar2026!Test-OK';

  await page.goto('/inscription');

  await page.locator('input[id=firstName]').fill('Test');
  await page.locator('input[id=lastName]').fill('User');
  await page.locator('input[id=email]').fill(email);
  await page.locator('input[id=password]').fill(password);
  await page.locator('input[id=accept]').check();

  await page.getByRole('button', { name: /Créer mon compte/i }).click();

  // Redirection vers /mon-profil après succès.
  await expect(page).toHaveURL(/mon-profil/, { timeout: 15_000 });
});

test('login wrong password shows generic error (anti-énumération)', async ({
  page,
}) => {
  await page.goto('/connexion');
  await page.locator('input[id=login-email]').fill('inexistant@hadar.test');
  await page.locator('input[id=login-password]').fill('Wrong-Password-1234!');
  await page.getByRole('button', { name: /Se connecter/i }).click();

  // Message générique → ni "email inexistant" ni "mauvais mot de passe"
  // distincts (anti-énumération).
  await expect(
    page.getByText(/Email ou mot de passe invalide/i),
  ).toBeVisible({ timeout: 10_000 });
});

test('legal pages are accessible without auth', async ({ page }) => {
  for (const path of [
    '/conditions-generales',
    '/politique-confidentialite',
    '/donnees-personnelles',
    '/regles-de-publication',
    '/faq',
    '/qui-sommes-nous',
  ]) {
    const res = await page.goto(path);
    expect(res?.status(), `${path} should be 200`).toBe(200);
  }
});

test('admin redirects to login when unauthenticated', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/connexion/);
});

test('search returns risk level for any contact (graceful)', async ({
  page,
}) => {
  await page.goto('/');

  const searchInput = page
    .locator('form[role="search"] input[name="q"]')
    .first();
  await searchInput.fill('+212600000000');
  await searchInput.press('Enter');

  // L'UI doit afficher quelque chose après la recherche (résultat ou
  // message "aucun signalement"). On attend un sélecteur connu de
  // SearchResult.
  await expect(
    page.locator('text=/Restez vigilant|Aucun signalement|signalement détecté/i'),
  ).toBeVisible({ timeout: 10_000 });
});
