import { expect, test } from "@playwright/test";
import { type Readable } from "node:stream";

const streamToString = async (stream: Readable | null) => {
  if (!stream) {
    throw new Error("No stream available");
    }

  const chunks: Buffer[] = [];

  return await new Promise<string>((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", (error) => reject(error));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });
};

test("user can create, connect, edit, and export a flow", async ({ page }) => {
  await page.goto("/flow");

  const addButton = page.getByRole("button", { name: "Add Box" });

  await addButton.click();
  await page.getByLabel("Title").fill("Start");

  await addButton.click();
  await page.getByLabel("Title").fill("End");

  const sourceHandle = page.locator('[data-testid$="-handle-source"]').first();
  const targetHandle = page.locator('[data-testid$="-handle-target"]').nth(1);

  await sourceHandle.dragTo(targetHandle);
  await expect(page.locator(".react-flow__edge")).toHaveCount(1);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export" }).click();
  const download = await downloadPromise;
  const content = await streamToString(await download.createReadStream());
  const parsed = JSON.parse(content);

  expect(parsed.nodes).toHaveLength(2);
  expect(parsed.edges).toHaveLength(1);
  const titles = parsed.nodes.map((node: any) => node.data.title).sort();
  expect(titles).toEqual(["End", "Start"].sort());
});
