import { expect, test } from '@playwright/test';

test('landing page lists all three modules', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: /Quantization Benchmark Visualizer/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Tokenizer Playground/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /LLM Cost Calculator/i })).toBeVisible();
});

test('quantization page renders chart and segmented control', async ({ page }) => {
  await page.goto('/quantization');
  await expect(page.getByRole('heading', { level: 1, name: /Quantization/i })).toBeVisible();
  await expect(page.getByRole('radiogroup', { name: /Quantization level/i })).toBeVisible();
  // Pareto chart image label
  await expect(page.getByRole('img', { name: /Pareto chart/i })).toBeVisible();
});

test('tokenizer page renders input and stats', async ({ page }) => {
  await page.goto('/tokenizer');
  await expect(page.getByRole('heading', { level: 1, name: /Tokenizer Playground/i })).toBeVisible();
  await expect(page.getByLabel(/Text to tokenize/i)).toBeVisible();
  await expect(page.getByRole('heading', { name: /Stats/i })).toBeVisible();
});

test('cost calculator renders template picker and matrix', async ({ page }) => {
  await page.goto('/cost-calculator');
  await expect(page.getByRole('heading', { level: 1, name: /LLM Cost Calculator/i })).toBeVisible();
  await expect(page.getByRole('radiogroup', { name: /Use case templates/i })).toBeVisible();
  await expect(page.getByRole('table')).toBeVisible();
});
