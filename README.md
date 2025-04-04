# @andreasnicolaou/query-builder

DEMO: https://stackblitz.com/edit/vitejs-vite-grxpgw5w

![GitHub package.json version](https://img.shields.io/github/package-json/v/andreasnicolaou/query-builder)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/andreasnicolaou/query-builder/build.yaml)
![GitHub License](https://img.shields.io/github/license/andreasnicolaou/query-builder)

![NPM Downloads](https://img.shields.io/npm/dm/%40andreasnicolaou%2Fquery-builder)

A flexible, type-safe query builder for constructing complex conditional expressions with support for nested groups, various operators, and function calls.

## Features

- Chainable builder API
- Supports multiple operator types (logical, comparison, set, etc.)
- Nested condition grouping
- Type-safe with TypeScript
- Serializable to JSON
- Human-readable string output

## Installation

```bash
npm install @andreasnicolaou/query-builder
```

## Basic Usage

```typescript
import { QueryBuilder } from '@andreasnicolaou/query-builder';

const query = new QueryBuilder()
  .where('name', '==', 'Andreas')
  .where('age', '>=', 18, 'or')
  .group((qb) => {
    qb.where('status', 'in', ['active', 'pending']).where('created', '>', new Date('2025-01-01').toISOString());
  })
  .toString();

console.log(query); // name == 'Andreas' or age >= 18 and (status in ('active', 'pending') and created > '2025-01-01T00:00:00.000Z')
```

## API Highlights

### Core Methods

- `.where(field, operator, value?, logicalOperator?)` - Add a condition
- `.group(callback, logicalOperator?)` - Create nested conditions
- `.toJSON()` - Get serializable representation
- `.toString()` - Get human-readable string

### Static Helpers

- `QueryBuilder.fn(name, ...args)` - Create function calls for values

## Supported Operators

| Type       | Operators                                           |
| ---------- | --------------------------------------------------- |
| Logical    | `and`, `or`                                         |
| Comparison | `=`, `==`, `===`, `!=`, `!==`, `>`, `<`, `>=`, `<=` |
| Word       | `starts with`, `ends with`, `contains`, `matches`   |
| Set        | `in`, `not in`                                      |

## Contributing

Contributions are welcome! If you encounter issues or have ideas to enhance the library, feel free to submit an issue or pull request.
