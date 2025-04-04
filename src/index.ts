export type WordOperator = 'starts with' | 'ends with' | 'contains' | 'matches';
export type SetOperator = 'not in' | 'in';
export type LogicalOperator = 'and' | 'or';
export type ComparisonOperator = '===' | '!==' | '==' | '=' | '!=' | '>=' | '<=' | '<' | '>';

// Complete set of all possible operators
export type Operators = WordOperator | SetOperator | LogicalOperator | ComparisonOperator;

export type PrimitiveValue = string | number | boolean | FunctionCall | null;
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
  value?: Value;
  negated?: boolean;
}

export type Value = RawValue | FunctionCall | QueryBuilderSerialized;

/**
 * Query builder for constructing complex conditional expressions.
 * Supports nested groups, various operators, and function calls.
 * @author Andreas Nicolaou <anicolaou66@gmail.com>
 */

export class QueryBuilder {
  private conditions: QueryBuilderSerialized = [];

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
   * Creates a nested group of conditions.
   * @param callback A function that receives a new QueryBuilder for the nested conditions
   * @param logicalOperator The logical operator to combine with previous conditions (default: 'and')
   * @returns The query builder instance for chaining
   * @memberof QueryBuilder
   */
  public group(callback: (qb: QueryBuilder) => void, logicalOperator: LogicalOperator = 'and'): this {
    const nested = new QueryBuilder();
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
  public toString(): string {
    return this.formatConditions(this.conditions);
  }

  /**
   *Adds a condition to the query builder.
   * @param field The field/column to compare
   * @param operator The comparison operator to use
   * @param value The value to compare against (optional for some operators)
   * @param logicalOperator The logical operator to combine with previous conditions (default: 'and')
   * @returns The query builder instance for chaining
   * @memberof QueryBuilder
   */
  public where(field: string, operator: Operators, value?: Value, logicalOperator: LogicalOperator = 'and'): this {
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
  private formatConditions(conditions: QueryBuilderSerialized, isSubquery = false): string {
    const result: string[] = [];
    let previousWasOperator = false;

    for (const cond of conditions) {
      if (typeof cond === 'string') {
        if (!previousWasOperator) {
          result.push(cond);
        }
        previousWasOperator = true;
      } else if ('group' in cond) {
        const groupStr = this.formatConditions(cond.group, true);
        if (groupStr) {
          result.push(`(${groupStr})`);
        }
        previousWasOperator = false;
      } else {
        if (result.length > 0 && !previousWasOperator) {
          result.push('and');
        }

        let conditionStr = `${cond.field} ${cond.operator}`;

        if (cond.value !== undefined) {
          if (Array.isArray(cond.value) && this.isConditionArray(cond.value)) {
            conditionStr += ` ${this.formatConditions(cond.value, true)}`;
          } else if (Array.isArray(cond.value)) {
            conditionStr += ` (${cond.value.map((v) => this.valueToString(v)).join(', ')})`;
          } else {
            conditionStr += ` ${this.valueToString(cond.value)}`;
          }
        }

        result.push(conditionStr);
        previousWasOperator = false;
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
   * Converts a value to its string representation for query formatting.
   * @param value The value to convert
   * @returns String representation of the value
   * @memberof QueryBuilder
   */
  private valueToString(value: PrimitiveValue | RawValueArray): string {
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
      return value.map((v) => this.valueToString(v)).join(', ');
    }

    if (typeof value === 'object' && value !== null && '$fn' in value) {
      const args = value.args?.map((arg) => this.valueToString(arg)).join(', ') || '';
      return `${value.$fn}(${args})`;
    }

    return JSON.stringify(value);
  }
}
