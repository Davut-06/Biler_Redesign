import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import ts from "typescript";

// Exercise the production TypeScript without adding a test runner dependency.
const source = fs.readFileSync(new URL("../src/utils/distributorEnquiry.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } });
const { validateEnquiry, normalizeEnquiry, createEnquiryMailto, postDistributorEnquiry, enquiryFields } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
const valid = { company: "Biler & Partners, Ltd. (2026)", taxId: "DE123456789", name: "Alexander", phone: "+49 (176) 123-4567", email: "name@company.com" };
const cases = {
  company: {
    pass: ["AB", "Компания 123", "Davut's & Co., (Global)-Ltd.", "株式会社ビラー", "Cafe\u0301"],
    fail: ["", "   ", "A", "A".repeat(121), "&&&", "Bad@Company", "Company\nInjected"],
  },
  taxId: {
    pass: ["12345678", "DE123456789", "AB-12 / 34.5", "A1234", "1".repeat(30)],
    fail: ["", "   ", "abcdef", "-----", "1234", "1".repeat(31), "DE@123456", "DE123\n456"],
  },
  name: {
    pass: ["Alexander", "Давут Ахмедов", "Davut Ahmedov", "Jean-Pierre", "O'Connor", "D’Arcy", "A".repeat(80), "李明", "Jose\u0301"],
    fail: ["", "  ", "A", "123", "12345", "Alex123", "sdv123", "@@@", "A1ex", "Person@Company", "---", "A".repeat(81)],
  },
  phone: {
    pass: ["+993 62 89 29 70", "+49 (176) 123-4567", "+49 (176) 123-45-67", "+49 176 12345678", "(0211) 1234567", "1234567", "123456789012345"],
    fail: ["", " ", "sdv", "abc123", "phone", "123", "123456", "1234567890123456", "123+456789", "++123456789", "+1234567 ext 1", "123\n4567"],
  },
  email: {
    pass: ["name@company.com", "sales@company.de", "test@company.com", "sales+distributor@sub.company.com"],
    fail: ["", " ", "test", "test@", "@test.com", "test @company.com", "test@company", "a..b@company.com", "test@-company.com", "test@company..com", "test@company.com\nBcc: victim@example.com"],
  },
};
for (const [field, groups] of Object.entries(cases)) {
  for (const [outcome, values] of Object.entries(groups)) {
    for (const value of values) {
      test(`${field}: ${JSON.stringify(value)} -> ${outcome}`, () => {
        assert.equal(Boolean(validateEnquiry({ ...valid, [field]: value })[field]), outcome === "fail");
      });
    }
  }
}

test("normalization trims every field and composes Unicode", () => {
  const input = Object.fromEntries(enquiryFields.map((field) => [field, `  ${valid[field]}  `]));
  assert.deepEqual(normalizeEnquiry(input), valid);
  assert.equal(normalizeEnquiry({ ...valid, name: " Jose\u0301 " }).name, "José");
  assert.deepEqual(validateEnquiry(input), {});
});

test("all invalid fields are reported together, with translated messages", () => {
  const errors = validateEnquiry(Object.fromEntries(enquiryFields.map((field) => [field, " "])));
  assert.deepEqual(Object.keys(errors), enquiryFields);
  for (const language of ["ru", "en"]) {
    const { partner } = JSON.parse(fs.readFileSync(new URL(`../src/locales/${language}.json`, import.meta.url), "utf8"));
    for (const field of enquiryFields) {
      assert.ok(partner.fields[field]);
      for (const value of cases[field].fail) assert.ok(partner.errors[validateEnquiry({ ...valid, [field]: value })[field]]);
    }
    assert.ok(partner.emailFallback && partner.success && partner.failure);
  }
});

test("mailto includes normalized fields in order and refuses invalid data", () => {
  const labels = Object.fromEntries(enquiryFields.map((field) => [field, field]));
  const url = new URL(createEnquiryMailto({ ...valid, taxId: " DE123456789 " }, labels, "Enquiry"));
  assert.equal(url.protocol, "mailto:");
  assert.equal(url.pathname, "biler.distribute@gmail.com");
  assert.equal(url.searchParams.get("body"), enquiryFields.map((field) => `${field}: ${valid[field]}`).join("\n"));
  assert.throws(() => createEnquiryMailto({ ...valid, phone: "sdv" }, labels, "Enquiry"));
});

test("future POST validates before networking and requires explicit server confirmation", async (context) => {
  const requests = [];
  let response = new Response(JSON.stringify({ success: true }), { status: 200 });
  context.mock.method(globalThis, "fetch", async (url, options) => {
    requests.push({ url, options });
    return response;
  });
  await assert.rejects(postDistributorEnquiry({ ...valid, phone: "sdv" }));
  assert.equal(requests.length, 0);
  await postDistributorEnquiry({ ...valid, company: "  " + valid.company + "  " });
  assert.equal(requests[0].url, "/api/distributor-enquiry");
  assert.equal(requests[0].options.method, "POST");
  assert.equal(requests[0].options.headers["Content-Type"], "application/json");
  assert.deepEqual(JSON.parse(requests[0].options.body), valid);
  for (const candidate of [
    new Response("Server failure", { status: 500 }),
    new Response("Invalid request", { status: 400 }),
    new Response("<html>SPA fallback</html>", { status: 200 }),
    new Response(JSON.stringify({ success: false }), { status: 200 }),
    new Response(JSON.stringify({}), { status: 200 }),
    new Response(null, { status: 204 }),
  ]) {
    response = candidate;
    await assert.rejects(postDistributorEnquiry(valid));
  }
  context.mock.method(globalThis, "fetch", async () => { throw new TypeError("Network failure"); });
  await assert.rejects(postDistributorEnquiry(valid));
});
