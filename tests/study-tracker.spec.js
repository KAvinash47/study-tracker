import { test, expect } from '@playwright/test';

test.describe('Study Tracker End-to-End Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the local dev server
    await page.goto('http://localhost:5175/');
  });

  test('should load the dashboard successfully', async ({ page }) => {
    // Check if the logo title is visible (using visible filter to avoid mobile/desktop duplicate issues)
    await expect(page.locator('h1:has-text("METRICSTUDY")').filter({ visible: true }).first()).toBeVisible();
    
    // Check if the dashboard panels are loaded
    await expect(page.locator('text=dashboard Panel').first()).toBeVisible();
    await expect(page.locator("text=Today's Focus")).toBeVisible();
    await expect(page.locator('text=Daily Attendance Logging')).toBeVisible();
  });

  test('should navigate to the Pomodoro tab and verify elements', async ({ page }) => {
    // Click on Pomodoro Focus tab
    await page.locator('text=Pomodoro Focus').click();
    
    // Verify the Pomodoro Panel heading and controls
    await expect(page.locator('text=pomodoro Panel')).toBeVisible();
    await expect(page.locator('text=Pomodoro Focus Timer')).toBeVisible();
    await expect(page.locator('text=Timer Mode')).toBeVisible();
    await expect(page.locator('text=Ambient Sound generator')).toBeVisible();
  });

  test('should navigate to the Topic Roadmap and toggle syllabus chapters', async ({ page }) => {
    // Click on Topic Roadmap tab
    await page.locator('text=Topic Roadmap').click();
    
    // Verify the panel loads
    await expect(page.locator('text=syllabus Panel')).toBeVisible();
    await expect(page.locator('text=Add Subject')).toBeVisible();
    
    // Toggle a chapter (e.g. "Scheduling")
    const chapterElement = page.locator('span:has-text("Scheduling")').first();
    await expect(chapterElement).toBeVisible();
    await chapterElement.click();
    
    // Check if the label updates to In Progress
    await expect(page.locator('span:has-text("IN PROGRESS")').first()).toBeVisible();
  });

  test('should log, list, toggle, and delete mistakes in the Mistake Notebook', async ({ page }) => {
    // Click on Mistake Notebook tab
    await page.locator('text=Mistake Notebook').click();
    
    // Verify the panel loads
    await expect(page.locator('text=mistakes Panel')).toBeVisible();
    await expect(page.locator('text=Log New Mistake')).toBeVisible();
    
    // Fill out the Log New Mistake form
    await page.fill('textarea[placeholder*="transitive dependency"]', 'Missed base case in recursion logic');
    await page.selectOption('select', 'Conceptual gap');
    await page.fill('input[placeholder*="Candidate Key"]', 'Recursion & Induction');
    await page.fill('input[type="date"]', '2026-07-02');
    
    // Click submit and handle alert dialogue
    page.once('dialog', dialog => dialog.dismiss());
    await page.click('button:has-text("Save Mistake Log")');
    
    // Verify the logged mistake is shown in the database
    await expect(page.locator('text=Missed base case in recursion logic')).toBeVisible();
    await expect(page.locator('text=Recursion & Induction')).toBeVisible();
    
    // Toggle Done checkbox
    const toggleBtn = page.locator('button[title="Mark as Revised"]').first();
    await toggleBtn.click();
    
    // Verify Revised badge appears
    await expect(page.locator('span:has-text("Revised")').first()).toBeVisible();
    
    // Delete mistake
    page.once('dialog', dialog => dialog.accept());
    await page.locator('button[title="Delete Log"]').first().click();
    
    // Verify it is removed
    await expect(page.locator('text=Missed base case in recursion logic')).not.toBeVisible();
  });

  test('should navigate to the PYQ Engine, log a PYQ attempt, verify it and delete it', async ({ page }) => {
    // Click on PYQ Engine tab
    await page.locator('text=PYQ Engine').click();
    
    // Verify headers
    await expect(page.locator('text=pyqs Panel')).toBeVisible();
    await expect(page.locator('text=Log PYQ Attempt')).toBeVisible();
    
    // Fill out the form
    await page.locator('form select').nth(0).selectOption('Database Management Systems');
    await page.fill('input[placeholder*="TCP Congestion Window Math"]', 'BCNF decomposition lossy vs lossless join');
    await page.locator('form select').nth(1).selectOption('Hard');
    await page.fill('input[placeholder*="2024"]', '2022');
    await page.locator('form select').nth(2).selectOption('Re-attempt needed');
    await page.fill('textarea[placeholder*="What was tricky?"]', 'Lossless join holds if R1 intersect R2 determines R1-R2 or R2-R1.');
    
    // Click submit
    page.once('dialog', dialog => dialog.dismiss());
    await page.click('button:has-text("Log PYQ Entry")');
    
    // Verify the record is logged
    await expect(page.locator('text=BCNF decomposition lossy vs lossless join')).toBeVisible();
    await expect(page.locator('text=GATE 2022')).toBeVisible();
    
    // Delete record
    page.once('dialog', dialog => dialog.accept());
    await page.locator('button[title="Delete Record"]').first().click();
    
    // Verify it is removed
    await expect(page.locator('text=BCNF decomposition lossy vs lossless join')).not.toBeVisible();
  });

  test('should navigate to Coding Practice and trigger AI analysis', async ({ page }) => {
    // Click on Coding Practice tab
    await page.locator('text=Coding Practice').click();
    
    // Verify headers
    await expect(page.locator('text=coding Panel')).toBeVisible();
    await expect(page.locator('h4:has-text("LeetCode")')).toBeVisible();
    await expect(page.locator('h4:has-text("GeeksforGeeks")')).toBeVisible();
    await expect(page.locator('h4:has-text("HackerRank")')).toBeVisible();
    
    // Click plus button on LeetCode card (first + button)
    const plusBtn = page.locator('button:has-text("+")').first();
    await plusBtn.click();
    
    // Trigger AI analysis and handle alert dialog
    page.once('dialog', dialog => dialog.dismiss());
    await page.click('button:has-text("Trigger AI Review")');
    
    // Wait for the simulated AI response delay
    await page.waitForTimeout(2000);
    
    // Verify diagnostic summary
    await expect(page.locator('text=Diagnostic Summary')).toBeVisible();
    await expect(page.locator('text=Total problems solved')).toBeVisible();
  });

  test('should navigate to the Analytics tab and verify reports and export card', async ({ page }) => {
    // Click on Analytics & Reports tab
    await page.locator('text=Analytics & Reports').click();
    
    // Verify headers
    await expect(page.locator('text=analytics Panel')).toBeVisible();
    await expect(page.locator('text=Performance Analytics')).toBeVisible();
    
    // Scroll down and verify Report Card / Exporters
    await expect(page.locator('text=Shareable Achievement Card')).toBeVisible();
    await expect(page.locator('text=Export Performance Report')).toBeVisible();
    await expect(page.locator('text=Export Metrics Database (JSON)')).toBeVisible();
    await expect(page.locator('text=Export Summary Report (Markdown)')).toBeVisible();
  });
});
