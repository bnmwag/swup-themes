// Copies every .css file from src/ to dist/ keeping the folder layout.
import { Glob } from "bun";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";

const glob = new Glob("**/*.css");
for await (const file of glob.scan("src")) {
  const out = join("dist", file);
  await mkdir(dirname(out), { recursive: true });
  await Bun.write(out, Bun.file(join("src", file)));
  console.log("copied", file);
}
