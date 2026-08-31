import { readFile } from "node:fs/promises";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { SOURCE_LOCK_IDS, validateSourceLocks } from "./lib/source-locks.mjs";

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validatedSources = await validateSourceLocks();

for (const [label, sourceId, schemaPath] of [
  ["answer-pack source", SOURCE_LOCK_IDS.ANSWER_PACKS, "schemas/answer-pack-source.schema.json"],
  ["corpus-admission source", SOURCE_LOCK_IDS.CORPUS_ADMISSIONS, "schemas/corpus-admission-source.schema.json"],
  ["OKF federation source lock", SOURCE_LOCK_IDS.OKF_FEDERATION, "schemas/okf-federation-lock.schema.json"],
]) {
  const validate = ajv.compile(await readJson(schemaPath));
  const source = validatedSources.sourcesById.get(sourceId).value;
  if (!validate(source)) throw new Error(`${label} schema validation failed: ${ajv.errorsText(validate.errors)}`);
}

console.log(`Validated ${validatedSources.sourcesById.size} authored source locks before generation.`);
