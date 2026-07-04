import { expect, test } from "@playwright/test";

test("the sovereign demo flow: landing → analyze → residency proof", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /never leaves the country/i }),
  ).toBeVisible();

  await page.getByRole("link", { name: /enter the demo/i }).first().click();
  await expect(page).toHaveURL(/\/workspace$/);

  await page.getByRole("button", { name: /analyze in-region/i }).click();
  await expect(page).toHaveURL(/\/workspace\/result$/);

  await expect(page.getByText(/Processed in Johannesburg/i)).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText(/Egress: none/i).first()).toBeVisible();
  await expect(page.getByText(/External API calls at inference/i)).toBeVisible();
});

test("the audit trail lists in-region PHI accesses", async ({ page }) => {
  await page.goto("/audit");
  await expect(page.getByRole("heading", { name: "Audit trail" })).toBeVisible();
  await expect(page.getByText("af-south-1").first()).toBeVisible();
  await expect(page.getByText(/Export for regulator/i)).toBeVisible();
});
