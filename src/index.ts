export type WordOperator = 'starts with' | 'ends with' | 'contains' | 'matches' | 'like' | 'ilike';
export type SetOperator = 'not in' | 'in';
export type LogicalOperator = 'and' | 'or';
export type ComparisonOperator = '===' | '!==' | '==' | '=' | '!=' | '>=' | '<=' | '<' | '>';
export type RangeOperator = 'between' | 'not between';
export type NullOperator = 'is null' | 'is not null' | 'is empty' | 'is not empty';
export type ArrayStyle = 'parens' | 'brackets';

// Complete set of all possible operators
export type Operators =
  | WordOperator
  | SetOperator
  | LogicalOperator
  | ComparisonOperator
  | RangeOperator
  | NullOperator;

export type PrimitiveValue = string | number | boolean | FunctionCall | null | object;
export type RawValueArray = (PrimitiveValue | FunctionCall)[] | RawValueArray[];
export type RawValue = PrimitiveValue | RawValueArray;

export interface FunctionCall {
  $fn: string;
  args?: (PrimitiveValue | RawValueArray)[];
}

export type QueryBuilderSerialized = (LogicalOperator | Condition | { group: QueryBuilderSerialized })[];

export interface Condition {
  field: string;
  operator: Operators;
  value?: RawValue;
}

export interface SkipWhenOptions {
  null?: boolean;
  undefined?: boolean;
  emptyString?: boolean;
  emptyArray?: boolean;
  nan?: boolean;
  emptyObject?: boolean;
}

/**
 * Query builder for constructing complex conditional expressions.
 * Supports nested groups, various operators, and function calls.
 * @author Andreas Nicolaou <anicolaou66@gmail.com>
 */

export class QueryBuilder {
  private readonly conditions: QueryBuilderSerialized = [];
  private skipOptions: SkipWhenOptions = {
    null: true,
    undefined: true,
    emptyString: true,
    emptyArray: true,
    nan: true,
    emptyObject: true,
  };

  /**
   * Creates a function call object that can be used as a value in conditions.
   * @param name The name of the function to call
   * @param args Arguments to pass to the function
   * @returns A FunctionCall object representing the function invocation
   * @memberof QueryBuilder
   */
  public static fn(name: string, ...args: (PrimitiveValue | RawValueArray)[]): FunctionCall {
    return { $fn: name, args };
  }

  /**
   * Validates if an operator is compatible with a value type
   * @param operator The operator to validate
   * @param value The value to validate against
   * @returns Validation result with error message if invalid
   * @memberof QueryBuilder
   */
  public static validateOperator(operator: Operators, value?: RawValue): { valid: boolean; error?: string } {
    const nullOps: NullOperator[] = ['is null', 'is not null', 'is empty', 'is not empty'];
    const rangeOps: RangeOperator[] = ['between', 'not between'];
    const setOps: SetOperator[] = ['in', 'not in'];

    // Null operators shouldn't have values
    if (nullOps.includes(operator as NullOperator) && value !== undefined) {
      return { valid: false, error: `Operator '${operator}' should not have a value` };
    }

    // Range operators need arrays with 2 elements
    if (rangeOps.includes(operator as RangeOperator)) {
      if (!Array.isArray(value) || value.length !== 2) {
        return { valid: false, error: `Operator '${operator}' requires an array with exactly 2 values` };
      }
    }

    // Set operators need arrays
    if (setOps.includes(operator as SetOperator)) {
      if (!Array.isArray(value)) {
        return { valid: false, error: `Operator '${operator}' requires an array value` };
      }
    }

    return { valid: true };
  }

  /**
   * Adds a BETWEEN condition.
   */
  public between(field: string, range: [RawValue, RawValue], logicalOperator: LogicalOperator = 'and'): this {
    return this.where(field, 'between', range, logicalOperator);
  }

  /**
   * Adds an equals (=) condition.
   */
  public equals(field: string, value: RawValue, logicalOperator: LogicalOperator = 'and'): this {
    return this.where(field, '=', value, logicalOperator);
  }

  /**
   * Adds a greater than (>) condition.
   */
  public greaterThan(field: string, value: RawValue, logicalOperator: LogicalOperator = 'and'): this {
    return this.where(field, '>', value, logicalOperator);
  }

  /**
   * Adds a greater than or equal (>=) condition.
   */
  public greaterThanOrEqual(field: string, value: RawValue, logicalOperator: LogicalOperator = 'and'): this {
    return this.where(field, '>=', value, logicalOperator);
  }

  /**
   * Creates a nested group of conditions.
   * @param callback A function that receives a new QueryBuilder for the nested conditions
   * @param logicalOperator The logical operator to combine with previous conditions (default: 'and')
   * @returns The query builder instance for chaining
   * @memberof QueryBuilder
   */
  public group(callback: (qb: QueryBuilder) => void, logicalOperator: LogicalOperator = 'and'): this {
    const nested = new QueryBuilder().skipWhen(this.skipOptions);
    callback(nested);
    const nestedConditions = nested.toJSON();
    if (nestedConditions.length > 0) {
      if (this.conditions.length > 0 && typeof this.conditions[this.conditions.length - 1] !== 'string') {
        this.conditions.push(logicalOperator); // Insert the logical operator between groups
      }
      this.conditions.push({ group: nestedConditions });
    }
    return this;
  }

  /**
   * Adds an ILIKE (case-insensitive like) condition.
   */
  public ilike(field: string, value: RawValue, logicalOperator: LogicalOperator = 'and'): this {
    return this.where(field, 'ilike', value, logicalOperator);
  }

  /**
   * Adds an IN condition.
   */
  public in(field: string, values: RawValueArray, logicalOperator: LogicalOperator = 'and'): this {
    return this.where(field, 'in', values, logicalOperator);
  }

  /**
   * Adds an IS EMPTY condition.
   */
  public isEmpty(field: string, logicalOperator: LogicalOperator = 'and'): this {
    return this.where(field, 'is empty', undefined, logicalOperator);
  }

  /**
   * Adds an IS NOT EMPTY condition.
   */
  public isNotEmpty(field: string, logicalOperator: LogicalOperator = 'and'): this {
    return this.where(field, 'is not empty', undefined, logicalOperator);
  }

  /**
   * Adds an IS NOT NULL condition.
   */
  public isNotNull(field: string, logicalOperator: LogicalOperator = 'and'): this {
    return this.where(field, 'is not null', undefined, logicalOperator);
  }

  /**
   * Adds an IS NULL condition.
   */
  public isNull(field: string, logicalOperator: LogicalOperator = 'and'): this {
    return this.where(field, 'is null', undefined, logicalOperator);
  }

  /**
   * Adds a less than (<) condition.
   */
  public lessThan(field: string, value: RawValue, logicalOperator: LogicalOperator = 'and'): this {
    return this.where(field, '<', value, logicalOperator);
  }

  /**
   * Adds a less than or equal (<=) condition.
   */
  public lessThanOrEqual(field: string, value: RawValue, logicalOperator: LogicalOperator = 'and'): this {
    return this.where(field, '<=', value, logicalOperator);
  }

  /**
   * Adds a LIKE condition.
   */
  public like(field: string, value: RawValue, logicalOperator: LogicalOperator = 'and'): this {
    return this.where(field, 'like', value, logicalOperator);
  }

  /**
   * Adds a loose equals (==) condition.
   */
  public looseEquals(field: string, value: RawValue, logicalOperator: LogicalOperator = 'and'): this {
    return this.where(field, '==', value, logicalOperator);
  }

  /**
   * Adds a NOT BETWEEN condition.
   */
  public notBetween(field: string, range: [RawValue, RawValue], logicalOperator: LogicalOperator = 'and'): this {
    return this.where(field, 'not between', range, logicalOperator);
  }

  /**
   * Adds a not equals (!=) condition.
   */
  public notEquals(field: string, value: RawValue, logicalOperator: LogicalOperator = 'and'): this {
    return this.where(field, '!=', value, logicalOperator);
  }

  /**
   * Adds a NOT IN condition.
   */
  public notIn(field: string, values: RawValueArray, logicalOperator: LogicalOperator = 'and'): this {
    return this.where(field, 'not in', values, logicalOperator);
  }

  /**
   * Configures which values should be skipped when adding conditions.
   * @param options Configuration for value skipping behavior
   * @returns The query builder instance for chaining
   * @memberof QueryBuilder
   */
  public skipWhen(options?: SkipWhenOptions): this {
    this.skipOptions = {
      null: true,
      undefined: true,
      emptyString: true,
      emptyArray: true,
      nan: true,
      emptyObject: false,
      ...options,
    };
    return this;
  }

  /**
   * Adds a strict equals (===) condition.
   */
  public strictEquals(field: string, value: RawValue, logicalOperator: LogicalOperator = 'and'): this {
    return this.where(field, '===', value, logicalOperator);
  }

  /**
   * Adds a strict not equals (!==) condition.
   */
  public strictNotEquals(field: string, value: RawValue, logicalOperator: LogicalOperator = 'and'): this {
    return this.where(field, '!==', value, logicalOperator);
  }
  /**
   * Serializes the query builder's conditions to a JSON-compatible structure.
   * @returns The serialized conditions array
   * @memberof QueryBuilder
   */
  public toJSON(): QueryBuilderSerialized {
    return this.conditions;
  }

  /**
   * Converts the query builder's conditions to a human-readable string representation.
   * @returns A string representation of the query conditions
   * @memberof QueryBuilder
   */
  /**
   * Converts the query builder's conditions to a human-readable string representation.
   * @param options Optional formatting options (arrayStyle: 'sql' | 'php')
   * @returns A string representation of the query conditions
   * @memberof QueryBuilder
   */
  public toString(options?: { arrayStyle?: ArrayStyle }): string {
    return this.formatConditions(this.conditions, false, options?.arrayStyle || 'parens');
  }

  /**
   * Adds a condition to the query builder.
   * @param field The field/column to compare
   * @param operator The comparison operator to use
   * @param value The value to compare against (optional for some operators)
   * @param logicalOperator The logical operator to combine with previous conditions (default: 'and')
   * @returns The query builder instance for chaining
   * @memberof QueryBuilder
   */
  public where(field: string, operator: Operators, value?: RawValue, logicalOperator: LogicalOperator = 'and'): this {
    // Don't skip values for null operators (they don't need values)
    const nullOps: NullOperator[] = ['is null', 'is not null', 'is empty', 'is not empty'];
    const isNullOperator = nullOps.includes(operator as NullOperator);

    if (!isNullOperator && this.shouldSkipValue(value)) {
      return this;
    }

    if (this.conditions.length > 0) {
      this.conditions.push(logicalOperator); // Insert logical operator between conditions
    }
    this.conditions.push({ field, operator, value });
    return this;
  }

  /**
   * Formats conditions into a string.
   * @param conditions The conditions array to format
   * @param isSubquery Whether this is formatting a nested subquery
   * @returns Formatted string representation of the conditions
   * @memberof QueryBuilder
   */
  private formatConditions(
    conditions: QueryBuilderSerialized,
    isSubquery = false,
    arrayStyle: ArrayStyle = 'parens'
  ): string {
    const result: string[] = [];

    for (const cond of conditions) {
      if (typeof cond === 'string') {
        // This is a logical operator (and/or)
        result.push(cond);
      } else if ('group' in cond) {
        const groupStr = this.formatConditions(cond.group, true, arrayStyle);
        if (groupStr) {
          result.push(`(${groupStr})`);
        }
      } else {
        let conditionStr = `${cond.field} ${cond.operator}`;

        // Handle null operators (no value needed)
        const nullOps: NullOperator[] = ['is null', 'is not null', 'is empty', 'is not empty'];
        const isNullOperator = nullOps.includes(cond.operator as NullOperator);

        if (!isNullOperator && cond.value !== undefined) {
          if (Array.isArray(cond.value) && this.isConditionArray(cond.value)) {
            conditionStr += ` ${this.formatConditions(cond.value, true, arrayStyle)}`;
          } else if (Array.isArray(cond.value)) {
            // Handle 'between' and 'not between' with array values
            const rangeOps: RangeOperator[] = ['between', 'not between'];
            if (rangeOps.includes(cond.operator as RangeOperator)) {
              conditionStr += ` ${cond.value
                .flat()
                .map((v) => this.valueToString(v, arrayStyle))
                .join(' and ')}`;
            } else {
              // Use arrayStyle for array formatting
              const arrStr = cond.value
                .flat()
                .map((v) => this.valueToString(v, arrayStyle))
                .join(', ');
              if (arrayStyle === 'brackets') {
                conditionStr += ` [${arrStr}]`;
              } else {
                conditionStr += ` (${arrStr})`;
              }
            }
          } else {
            conditionStr += ` ${this.valueToString(cond.value, arrayStyle)}`;
          }
        } else if (!isNullOperator) {
          conditionStr += ` undefined`;
        }

        result.push(conditionStr);
      }
    }

    let finalString = result.join(' ');
    finalString = finalString.replace(/\(\((.*?)\)\)/g, '($1)');
    return isSubquery ? `(${finalString})` : finalString;
  }

  /**
   * Checks if a value is a condition array (QueryBuilderSerialized).
   * @param value The value to check
   * @returns True if the value is a condition array, false otherwise
   * @memberof QueryBuilder
   */
  private isConditionArray(value: RawValueArray | QueryBuilderSerialized): value is QueryBuilderSerialized {
    return (
      Array.isArray(value) && value.some((item) => typeof item === 'object' && item !== null && 'operator' in item)
    );
  }

  /**
   * Checks if a value should be skipped based on current skip options
   * @param value The value to check
   * @returns True if the value should be skipped
   * @memberof QueryBuilder
   */
  private shouldSkipValue(value: RawValue | undefined): boolean {
    if (!this.skipOptions) return false;

    if (value === null && this.skipOptions.null !== false) {
      return true;
    }

    if (value === undefined && this.skipOptions.undefined !== false) {
      return true;
    }

    if (typeof value === 'string' && value === '' && this.skipOptions.emptyString !== false) {
      return true;
    }

    if (Array.isArray(value) && this.skipOptions.emptyArray !== false) {
      if (
        value.length === 0 ||
        value.every(
          (item) => item === null || item === undefined || item === '' || (typeof item === 'number' && isNaN(item))
        )
      ) {
        return true;
      }
    }

    if (typeof value === 'number' && isNaN(value) && this.skipOptions.nan !== false) {
      return true;
    }

    if (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      !('$fn' in value) && // Don't skip FunctionCall objects
      Object.keys(value).length === 0 &&
      this.skipOptions.emptyObject
    ) {
      return true;
    }

    return false;
  }

  /**
   * Converts a value to its string representation for query formatting.
   * @param value The value to convert
   * @returns String representation of the value
   * @memberof QueryBuilder
   */
  private valueToString(value: PrimitiveValue | RawValueArray, arrayStyle: ArrayStyle = 'parens'): string {
    if (value === null) {
      return 'null';
    }

    if (value === undefined) {
      return 'undefined';
    }

    if (typeof value === 'string') {
      return `'${value.replace(/'/g, "''")}'`;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return value.toString();
    }

    if (Array.isArray(value)) {
      const arrStr = value
        .flat()
        .map((v) => this.valueToString(v, arrayStyle))
        .join(', ');
      return arrayStyle === 'brackets' ? `[${arrStr}]` : `(${arrStr})`;
    }

    if (typeof value === 'object' && value !== null && '$fn' in value) {
      const args = value.args?.map((arg) => this.valueToString(arg, arrayStyle)).join(', ') || '';
      return `${value.$fn}(${args})`;
    }

    return JSON.stringify(value);
  }
}
