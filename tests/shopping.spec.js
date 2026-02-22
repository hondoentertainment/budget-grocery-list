import { test, expect } from '@playwright/test';

test.describe('Budget Grocery List - World Class Features', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should display the world-class header and title', async ({ page }) => {
        await expect(page).toHaveTitle(/Budget Grocery List/);
        await expect(page.locator('h1')).toContainText('Budget Grocery List');
    });

    test('should manage budget and track estimated total', async ({ page }) => {
        const budgetInput = page.locator('input[placeholder="Enter your budget"]');
        await budgetInput.fill('100');

        const itemInput = page.locator('input[placeholder="Enter a grocery item (e.g., organic eggs)"]');
        await itemInput.fill('Organic Wagyu Steak');
        await page.keyboard.press('Enter');

        const priceInput = page.locator('.price-input').first();
        await priceInput.fill('120');

        await expect(page.locator('.budget-estimated')).toHaveClass(/over-budget/);
        await expect(page.locator('.over-budget-warning')).toBeVisible();
        await expect(page.locator('.over-budget-warning')).toContainText('Over budget by $20.00');
    });

    test('should trigger AI features and display recommendations', async ({ page }) => {
        // Add an item first to enable expert features
        await page.locator('input[placeholder="Enter a grocery item (e.g., organic eggs)"]').fill('Salmon');
        await page.keyboard.press('Enter');

        // Test Expert Budget Hacks
        const hackBtn = page.getByRole('button', { name: 'Refresh Hacks' });
        await expect(hackBtn).toBeVisible();
        await hackBtn.click();
        await expect(page.locator('.hack-item')).toHaveCount(3);

        // Test Culinary Concierge
        const strategyBtn = page.getByRole('button', { name: 'Get Strategy' });
        await expect(strategyBtn).toBeVisible();
        await strategyBtn.click();
        await expect(page.locator('.flavor-value')).toBeVisible();
        await expect(page.locator('.flavor-tag')).toHaveCount(2);
    });

    test('should support quick-add staples with kinetic feedback', async ({ page }) => {
        const milkChip = page.getByRole('button', { name: '🥛 Milk' });
        await expect(milkChip).toBeVisible();
        await milkChip.click();

        const listItem = page.locator('.item-row');
        await expect(listItem).toContainText('Milk');
    });
});
