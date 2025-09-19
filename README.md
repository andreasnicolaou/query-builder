# @andreasnicolaou/query-builder

DEMO: https://stackblitz.com/edit/vitejs-vite-grxpgw5w

![GitHub package.json version](https://img.shields.io/github/package-json/v/andreasnicolaou/query-builder)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/andreasnicolaou/query-builder/build.yaml)
![GitHub License](https://img.shields.io/github/license/andreasnicolaou/query-builder)

![NPM Downloads](https://img.shields.io/npm/dm/%40andreasnicolaou%2Fquery-builder)

A flexible, type-safe query builder for constructing complex conditional expressions with support for nested groups, various operators, and function calls.

> **Note:** This is _not_ an ORM and does **not** execute queries or connect to any database. It's a serialization and expression-building utility, ideal for building advanced search/filter UIs, custom DSLs, or backend query engines.

## Features

- Chainable builder API
- Supports multiple operator types (logical, comparison, set, etc.)
- Nested condition grouping
- Type-safe with TypeScript
- Serializable to JSON
- Human-readable string output

### Package Managers

```bash
# npm
npm install @andreasnicolaou/query-builder

# yarn
yarn add @andreasnicolaou/query-builder

# pnpm
pnpm add @andreasnicolaou/query-builder
```

### CDN Usage

For direct browser usage without a build step:

```html
<!-- unpkg CDN (latest version, unminified) -->
<script src="https://unpkg.com/@andreasnicolaou/query-builder/dist/index.umd.js"></script>

<!-- unpkg CDN (latest version, minified) -->
<script src="https://unpkg.com/@andreasnicolaou/query-builder/dist/index.umd.min.js"></script>

<!-- jsDelivr CDN (unminified) -->
<script src="https://cdn.jsdelivr.net/npm/@andreasnicolaou/query-builder/dist/index.umd.js"></script>

<!-- jsDelivr CDN (minified) -->
<script src="https://cdn.jsdelivr.net/npm/@andreasnicolaou/query-builder/dist/index.umd.min.js"></script>
```

### Usage Examples

#### ES Modules (Recommended)

```typescript
import { QueryBuilder } from '@andreasnicolaou/query-builder';

const qb = new QueryBuilder();
qb.where('name', 'ilike', '%andreas%');
console.log(qb.toString());
```

#### CommonJS

```javascript
const { QueryBuilder } = require('@andreasnicolaou/query-builder');

const qb = new QueryBuilder();
qb.where('age', '>', 30);
console.log(qb.toString());
```

#### Browser (UMD via CDN)

```html
<!-- Use .umd.js for debugging, .umd.min.js for production -->
<script src="https://unpkg.com/@andreasnicolaou/query-builder/dist/index.umd.min.js"></script>
<script>
  // The global variable is 'queryBuilder'
  const qb = new queryBuilder.QueryBuilder();
  qb.where('active', '=', true);
  alert(qb.toString());
</script>
```

#### Browser (ES Modules via CDN)

```html
<script type="module">
  import { QueryBuilder } from 'https://unpkg.com/@andreasnicolaou/query-builder/dist/index.js';

  const qb = new QueryBuilder();
  qb.where('role', 'in', ['admin', 'user']);
  console.log(qb.toString());
</script>
```

#### TypeScript

```typescript
// Full type safety and IntelliSense support
import { QueryBuilder, QueryBuilderSerialized } from '@andreasnicolaou/query-builder';

const qb: QueryBuilder = new QueryBuilder();
// ...
```

## Basic Usage

```typescript
import { QueryBuilder } from '@andreasnicolaou/query-builder';

const query = new QueryBuilder()
  .where('name', 'ilike', '%andreas%') // Case-insensitive search
  .where('age', 'between', [18, 65], 'and') // Age range
  .where('email', 'is not null', undefined, 'and') // Email required
  .group((qb) => {
    qb.where('status', 'in', ['active', 'pending']).where('created', '>', new Date('2025-01-01').toISOString());
  })
  .toString();

console.log(query);
// name ilike '%andreas%' and age between 18 and 65 and email is not null and (status in ('active', 'pending') and created > '2025-01-01T00:00:00.000Z')
```

## Skipping Empty or Invalid Values

```typescript
import { QueryBuilder } from '@andreasnicolaou/query-builder';

const query = new QueryBuilder()
  .skipWhen({ emptyString: true, emptyArray: true })
  .where('name', '===', '')
  .where('age', '>', 36)
  .where('tags', 'in', [])
  .toString();

console.log(query); // age > 36
```

## UI-Focused Examples

### Advanced Search Form

```typescript
// Perfect for building complex search UIs
const searchQuery = new QueryBuilder()
  .where('title', 'ilike', '%react%') // Case-insensitive title search
  .where('price', 'between', [10, 100], 'and') // Price range
  .where('category', 'in', ['books', 'electronics'], 'and') // Multiple categories
  .group((nested) => {
    nested
      .where('rating', '>=', 4) // High rated
      .where('featured', '=', true, 'or'); // OR featured items
  }, 'and');

// Result: title ilike '%react%' and price between 10 and 100 and category in ('books', 'electronics') and (rating >= 4 or featured = true)
```

### User Profile Filters

```typescript
// Handle optional and required fields elegantly
const userQuery = new QueryBuilder()
  .skipWhen({ emptyString: true, null: false }) // Allow explicit nulls
  .where('email', 'is not null') // Email required
  .where('firstName', 'like', 'John%', 'and') // Starts with John
  .where('lastName', 'is not empty', undefined, 'and') // Last name provided
  .where('age', 'between', [18, 99], 'and') // Adult users
  .where('deletedAt', 'is null', undefined, 'and'); // Active users only

// Result: email is not null and firstName like 'John%' and lastName is not empty and age between 18 and 99 and deletedAt is null
```

## UI Validation & Error Handling

```typescript
import { QueryBuilder } from '@andreasnicolaou/query-builder';

// Validate user input before building queries
function buildSearchQuery(formData: any) {
  const errors: string[] = [];

  // Validate age range
  if (formData.ageMin && formData.ageMax) {
    const validation = QueryBuilder.validateOperator('between', [formData.ageMin, formData.ageMax]);
    if (!validation.valid) {
      errors.push(`Age range: ${validation.error}`);
    }
  }

  // Validate category selection
  if (formData.categories && formData.categories.length > 0) {
    const validation = QueryBuilder.validateOperator('in', formData.categories);
    if (!validation.valid) {
      errors.push(`Categories: ${validation.error}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }

  // Build query after validation
  return new QueryBuilder()
    .skipWhen({ emptyString: true, emptyArray: true })
    .where('name', 'ilike', `%${formData.search}%`)
    .where('age', 'between', [formData.ageMin, formData.ageMax])
    .where('category', 'in', formData.categories);
}
```

## API Highlights

### Core Methods

| Method                                                | Description                                                                                                               |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `.where(field, operator, value?, logicalOperator?)`   | Add a condition with any operator                                                                                         |
| `.group(callback, logicalOperator?)`                  | Create nested conditions (groups)                                                                                         |
| `.skipWhen(options?)`                                 | Configure automatic value skipping (`null`, `undefined`, `''`, `[]`, `NaN` are skipped by default; empty objects are not) |
| `.toJSON()`                                           | Get serializable representation                                                                                           |
| `.toString(options?)`                                 | Get human-readable string (optionally control array style)                                                                |
| `.between(field, range, logicalOperator?)`            | Add a `between` condition                                                                                                 |
| `.notBetween(field, range, logicalOperator?)`         | Add a `not between` condition                                                                                             |
| `.equals(field, value, logicalOperator?)`             | Add an equals (`=`) condition                                                                                             |
| `.notEquals(field, value, logicalOperator?)`          | Add a not equals (`!=`) condition                                                                                         |
| `.looseEquals(field, value, logicalOperator?)`        | Add a loose equals (`==`) condition                                                                                       |
| `.strictEquals(field, value, logicalOperator?)`       | Add a strict equals (`===`) condition                                                                                     |
| `.strictNotEquals(field, value, logicalOperator?)`    | Add a strict not equals (`!==`) condition                                                                                 |
| `.greaterThan(field, value, logicalOperator?)`        | Add a greater than (`>`) condition                                                                                        |
| `.greaterThanOrEqual(field, value, logicalOperator?)` | Add a greater than or equal (`>=`) condition                                                                              |
| `.lessThan(field, value, logicalOperator?)`           | Add a less than (`<`) condition                                                                                           |
| `.lessThanOrEqual(field, value, logicalOperator?)`    | Add a less than or equal (`<=`) condition                                                                                 |
| `.like(field, value, logicalOperator?)`               | Add a `like` condition                                                                                                    |
| `.ilike(field, value, logicalOperator?)`              | Add an `ilike` (case-insensitive like) condition                                                                          |
| `.in(field, values, logicalOperator?)`                | Add an `in` condition                                                                                                     |
| `.notIn(field, values, logicalOperator?)`             | Add a `not in` condition                                                                                                  |
| `.isNull(field, logicalOperator?)`                    | Add an `is null` condition                                                                                                |
| `.isNotNull(field, logicalOperator?)`                 | Add an `is not null` condition                                                                                            |
| `.isEmpty(field, logicalOperator?)`                   | Add an `is empty` condition                                                                                               |
| `.isNotEmpty(field, logicalOperator?)`                | Add an `is not empty` condition                                                                                           |

#### Static Helpers

| Method                                            | Description                                            |
| ------------------------------------------------- | ------------------------------------------------------ |
| `QueryBuilder.fn(name, ...args)`                  | Create function calls for values (e.g., `UPPER(name)`) |
| `QueryBuilder.validateOperator(operator, value?)` | Validate if an operator is compatible with a value     |

## Supported Operators

| Type       | Operators                                                          |
| ---------- | ------------------------------------------------------------------ |
| Logical    | `and`, `or`                                                        |
| Comparison | `=`, `==`, `===`, `!=`, `!==`, `>`, `<`, `>=`, `<=`                |
| Word       | `starts with`, `ends with`, `contains`, `matches`, `like`, `ilike` |
| Set        | `in`, `not in`                                                     |
| Range      | `between`, `not between`                                           |
| Null Check | `is null`, `is not null`, `is empty`, `is not empty`               |

## Contributing

Contributions are welcome! If you encounter issues or have ideas to enhance the library, feel free to submit an issue or pull request.
