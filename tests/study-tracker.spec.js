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

  test('should navigate to the Roadmap Planner and generate a timeline', async ({ page }) => {
    // Click on Roadmap Planner tab
    await page.locator('text=Roadmap Planner').click();
    
    // Verify the panel loads
    await expect(page.locator('text=roadmap Panel')).toBeVisible();
    await expect(page.locator('text=Syllabus Roadmap Planner')).toBeVisible();
    await expect(page.locator('text=Plan Parameters')).toBeVisible();
    
    // Fill out subject and topics
    await page.fill('input[placeholder="e.g. Computer Networks"]', 'Database Systems');
    await page.fill('textarea[placeholder*="Physical Layer"]', 'Chapter 1: Relational Algebra\nChapter 2: Normalization');
    
    // Click Generate
    await page.click('text=Generate Study Roadmap');
    
    // Wait for the roadmap to generate (with simulator timeout)
    await page.waitForTimeout(2000);
    
    // Verify milestones are displayed (using span to avoid strict-mode duplication with textarea input)
    await expect(page.locator('text=Generated Study Milestones')).toBeVisible();
    await expect(page.locator('span:has-text("Chapter 1: Relational Algebra")')).toBeVisible();
    await expect(page.locator('span:has-text("Chapter 2: Normalization")')).toBeVisible();
    
    // Verify Import button is visible
    await expect(page.locator('text=Import to Syllabus Tracker')).toBeVisible();
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
