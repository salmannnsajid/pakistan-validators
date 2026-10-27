# pakistan-validators

Validate, parse, and format Pakistani **CNIC** numbers and **mobile phone** numbers in JavaScript, TypeScript, and Node.js.

- Zero dependencies, ~2 KB, tree-shakeable
- TypeScript-first with full type definitions
- Accepts messy input: dashes, spaces, `+92`/`0092`/`92` prefixes, even Urdu (`۰-۹`) and Arabic-Indic (`٠-٩`) digits
- Works in Node, browsers, and edge runtimes

## Install

```sh
npm install pakistan-validators
```

## Validate a CNIC number

```ts
import { parseCNIC, isValidCNIC, formatCNIC } from "pakistan-validators";

parseCNIC("3520212345671");
// {
//   valid: true,
//   normalized: "3520212345671",
//   formatted: "35202-1234567-1",
//   province: "Punjab",
//   gender: "male"
// }

isValidCNIC("35202-1234567-1"); // true
formatCNIC("۳۵۲۰۲۱۲۳۴۵۶۷۱");    // "35202-1234567-1"
formatCNIC("garbage");           // null
```

`province` comes from the first digit (NADRA region code) and `gender` from
the parity of the last digit (odd = male, even = female).

Invalid input returns a reason instead of just `false`:

```ts
parseCNIC("352021234567");
// { valid: false, reason: "expected 13 digits, got 12" }
```

## Validate a Pakistani mobile number

```ts
import { parsePhone, isValidPhone, formatPhone } from "pakistan-validators";

parsePhone("+92 300 1234567");
// {
//   valid: true,
//   e164: "+923001234567",
//   local: "0300-1234567",
//   international: "+92 300 1234567",
//   prefix: "300"
// }

formatPhone("03001234567", "e164");          // "+923001234567"
formatPhone("00923001234567");               // "0300-1234567"
formatPhone("03001234567", "international"); // "+92 300 1234567"
```

All common input shapes normalize to the same number: `03001234567`,
`0300-1234567`, `+923001234567`, `923001234567`, `00923001234567`.

Validation covers the assigned mobile prefix ranges (0300–0349 and 0355).
The package deliberately does **not** report a carrier: since mobile number
portability, the prefix no longer reliably identifies the current network.

## Why not just a regex?

The usual CNIC regex (`^\d{5}-\d{7}-\d$`) accepts invalid region codes and
rejects real-world input that this package handles:

```ts
isValidCNIC("۳۵۲۰۲-۱۲۳۴۵۶۷-۱"); // true  — Urdu digits, common in copied text
isValidCNIC("3520212345671");    // true  — no dashes
isValidCNIC("95202-1234567-1");  // false — "9" is not a NADRA region code
isValidPhone("00923001234567");  // true  — 0092 prefix
isValidPhone("0399-1234567");    // false — unassigned prefix a regex happily accepts
```

A regex also can't tell you *why* input failed; `parseCNIC` and `parsePhone`
return a `reason` you can show to the user.

## API

| Function | Returns |
| --- | --- |
| `parseCNIC(input)` | `{ valid: true, normalized, formatted, province, gender }` or `{ valid: false, reason }` |
| `isValidCNIC(input)` | `boolean` |
| `formatCNIC(input)` | `"35202-1234567-1"` or `null` |
| `parsePhone(input)` | `{ valid: true, e164, local, international, prefix }` or `{ valid: false, reason }` |
| `isValidPhone(input)` | `boolean` |
| `formatPhone(input, style?)` | string in `"local"` (default), `"international"`, or `"e164"` style, or `null` |

## License

MIT
