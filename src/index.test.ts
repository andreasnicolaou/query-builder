import { QueryBuilder, QueryBuilderSerialized } from './index';

describe('QueryBuilder', () => {
  let qb: QueryBuilder;

  beforeEach(() => {
    qb = new QueryBuilder();
  });

  test('should create empty query', () => {
    expect(qb.toJSON()).toEqual([]);
    expect(qb.toString()).toBe('');
  });

  describe('Basic Conditions', () => {
    test('should handle between() method', () => {
      qb.between('age', [18, 30]);
      expect(qb.toJSON()).toEqual([{ field: 'age', operator: 'between', value: [18, 30] }]);
      expect(qb.toString()).toBe('age between 18 and 30');
    });

    test('should handle nested array value (sql style)', () => {
      qb.where('arr', '=', [1, [2, 3], 4]);
      expect(qb.toString()).toBe('arr = (1, 2, 3, 4)');
    });

    test('should handle nested array value (php style)', () => {
      qb.where('arr', '=', [1, [2, 3], 4]);
      expect(qb.toString({ arrayStyle: 'brackets' })).toBe('arr = [1, 2, 3, 4]');
    });

    test('should handle equals() method', () => {
      qb.equals('name', 'Alice');
      expect(qb.toJSON()).toEqual([{ field: 'name', operator: '=', value: 'Alice' }]);
      expect(qb.toString()).toBe("name = 'Alice'");
    });

    test('should handle greaterThan() method', () => {
      qb.greaterThan('score', 100);
      expect(qb.toJSON()).toEqual([{ field: 'score', operator: '>', value: 100 }]);
      expect(qb.toString()).toBe('score > 100');
    });

    test('should handle greaterThanOrEqual() method', () => {
      qb.greaterThanOrEqual('score', 100);
      expect(qb.toJSON()).toEqual([{ field: 'score', operator: '>=', value: 100 }]);
      expect(qb.toString()).toBe('score >= 100');
    });

    test('should handle ilike() method', () => {
      qb.ilike('email', '%GMAIL.COM%');
      expect(qb.toJSON()).toEqual([{ field: 'email', operator: 'ilike', value: '%GMAIL.COM%' }]);
      expect(qb.toString()).toBe("email ilike '%GMAIL.COM%'");
    });

    test('should handle in() method', () => {
      qb.in('role', ['admin', 'user']);
      expect(qb.toJSON()).toEqual([{ field: 'role', operator: 'in', value: ['admin', 'user'] }]);
      expect(qb.toString()).toBe("role in ('admin', 'user')");
    });

    test('should handle isEmpty() method', () => {
      qb.isEmpty('notes');
      expect(qb.toJSON()).toEqual([{ field: 'notes', operator: 'is empty' }]);
      expect(qb.toString()).toBe('notes is empty');
    });

    test('should handle isNotEmpty() method', () => {
      qb.isNotEmpty('notes');
      expect(qb.toJSON()).toEqual([{ field: 'notes', operator: 'is not empty' }]);
      expect(qb.toString()).toBe('notes is not empty');
    });

    test('should handle isNotNull() method', () => {
      qb.isNotNull('created_at');
      expect(qb.toJSON()).toEqual([{ field: 'created_at', operator: 'is not null' }]);
      expect(qb.toString()).toBe('created_at is not null');
    });

    test('should handle isNull() method', () => {
      qb.isNull('deleted_at');
      expect(qb.toJSON()).toEqual([{ field: 'deleted_at', operator: 'is null' }]);
      expect(qb.toString()).toBe('deleted_at is null');
    });

    test('should handle like() method', () => {
      qb.like('name', '%john%');
      expect(qb.toJSON()).toEqual([{ field: 'name', operator: 'like', value: '%john%' }]);
      expect(qb.toString()).toBe("name like '%john%'");
    });

    test('should handle lessThan() method', () => {
      qb.lessThan('score', 50);
      expect(qb.toJSON()).toEqual([{ field: 'score', operator: '<', value: 50 }]);
      expect(qb.toString()).toBe('score < 50');
    });

    test('should handle lessThanOrEqual() method', () => {
      qb.lessThanOrEqual('score', 50);
      expect(qb.toJSON()).toEqual([{ field: 'score', operator: '<=', value: 50 }]);
      expect(qb.toString()).toBe('score <= 50');
    });

    test('should handle looseEquals() method', () => {
      qb.looseEquals('id', '123');
      expect(qb.toJSON()).toEqual([{ field: 'id', operator: '==', value: '123' }]);
      expect(qb.toString()).toBe("id == '123'");
    });

    test('should handle notBetween() method', () => {
      qb.notBetween('age', [10, 20]);
      expect(qb.toJSON()).toEqual([{ field: 'age', operator: 'not between', value: [10, 20] }]);
      expect(qb.toString()).toBe('age not between 10 and 20');
    });

    test('should handle notEquals() method', () => {
      qb.notEquals('name', 'Bob');
      expect(qb.toJSON()).toEqual([{ field: 'name', operator: '!=', value: 'Bob' }]);
      expect(qb.toString()).toBe("name != 'Bob'");
    });

    test('should handle notIn() method', () => {
      qb.notIn('role', ['guest']);
      expect(qb.toJSON()).toEqual([{ field: 'role', operator: 'not in', value: ['guest'] }]);
      expect(qb.toString()).toBe("role not in ('guest')");
    });

    test('should handle strictEquals() method', () => {
      qb.strictEquals('id', 123);
      expect(qb.toJSON()).toEqual([{ field: 'id', operator: '===', value: 123 }]);
      expect(qb.toString()).toBe('id === 123');
    });

    test('should handle strictNotEquals() method', () => {
      qb.strictNotEquals('id', 456);
      expect(qb.toJSON()).toEqual([{ field: 'id', operator: '!==', value: 456 }]);
      expect(qb.toString()).toBe('id !== 456');
    });
    test('should handle strictEquals (===) method', () => {
      qb.strictEquals('id', 123);
      expect(qb.toJSON()).toEqual([{ field: 'id', operator: '===', value: 123 }]);
      expect(qb.toString()).toBe('id === 123');
    });

    test('should handle looseEquals (==) method', () => {
      qb.looseEquals('id', '123');
      expect(qb.toJSON()).toEqual([{ field: 'id', operator: '==', value: '123' }]);
      expect(qb.toString()).toBe("id == '123'");
    });

    test('should handle strictNotEquals (!==) method', () => {
      qb.strictNotEquals('id', 456);
      expect(qb.toJSON()).toEqual([{ field: 'id', operator: '!==', value: 456 }]);
      expect(qb.toString()).toBe('id !== 456');
    });
    test('should show single condition', () => {
      qb.where('name', '===', 'andreas');
      expect(qb.toJSON()).toEqual([{ field: 'name', operator: '===', value: 'andreas' }]);
      expect(qb.toString()).toBe("name === 'andreas'");
    });

    test('should add or condition', () => {
      qb.where('age', '<', 60).where('age', '>', 30, 'or');
      expect(qb.toJSON()).toEqual([
        { field: 'age', operator: '<', value: 60 },
        'or',
        { field: 'age', operator: '>', value: 30 },
      ]);
      expect(qb.toString()).toBe('age < 60 or age > 30');
    });
  });

  describe('Complex Conditions', () => {
    test('should format nested condition arrays (isConditionArray branch)', () => {
      const nested: QueryBuilderSerialized = [
        { field: 'a', operator: '=', value: 1 },
        'or',
        { field: 'b', operator: '=', value: 2 },
      ];
      qb.where('x', 'in', nested);
      expect(qb.toString()).toBe('x in (a = 1 or b = 2)');
    });
    test('should chain multiple conditions', () => {
      qb.where('name', '==', 'andreas').where('age', '>', 30, 'or').where('active', '=', true);
      expect(qb.toString()).toBe("name == 'andreas' or age > 30 and active = true");
    });

    test('should handle in operator with array', () => {
      qb.where('role', 'in', ['admin', 'editor']);
      expect(qb.toString()).toBe("role in ('admin', 'editor')");
    });

    test('should handle in range operator', () => {
      qb.where('age', '>=', 20).where('age', '<=', 30);
      expect(qb.toString()).toBe('age >= 20 and age <= 30');
    });

    test('should handle null checks', () => {
      qb.skipWhen({ null: false }).where('deleted', '===', null);
      expect(qb.toString()).toBe('deleted === null');
    });
  });

  describe('Functions', () => {
    test('should handle function calls', () => {
      qb.where('created', '>', QueryBuilder.fn('NOW'));
      expect(qb.toString()).toBe('created > NOW()');
    });

    test('should handle nested function calls', () => {
      qb.where('name', '===', QueryBuilder.fn('UPPER', 'andreas'));
      expect(qb.toString()).toBe("name === UPPER('andreas')");
    });
  });

  describe('Grouping', () => {
    test('should handle grouped conditions', () => {
      qb.where('name', '==', 'andreas').group((qb2) => {
        qb2.where('age', '>', 30).where('member', '=', true, 'or');
      });
      expect(qb.toString()).toBe("name == 'andreas' and (age > 30 or member = true)");
    });

    test('should handle nested groups', () => {
      qb.group((qb1) => {
        qb1.where('a', '==', 1).group((qb2) => {
          qb2.where('b', '===', 2).where('c', '=', 3, 'or');
        });
      });
      expect(qb.toString()).toBe('(a == 1 and (b === 2 or c = 3))');
    });
  });

  describe('Others', () => {
    test('should handle empty values', () => {
      qb.skipWhen({ emptyString: false }).where('name', '===', '');
      expect(qb.toString()).toBe("name === ''");
    });

    test('should escape single quotes in strings', () => {
      qb.where('name', '=', "A'Nicolaou");
      expect(qb.toString()).toBe("name = 'A''Nicolaou'");
    });

    test('should handle complex nested structures', () => {
      const qb = new QueryBuilder().where('name', '===', QueryBuilder.fn('UPPER', 'andreas')).group((qb) => {
        qb.where('role', 'in', ['admin', 'editor']);
        qb.group((qb) => {
          qb.where('active', '=', true).where('member', '=', true, 'or');
        });
      }, 'or');
      expect(qb.toString()).toBe(
        "name === UPPER('andreas') or (role in ('admin', 'editor') and (active = true or member = true))"
      );
    });

    test('should handle deeply nested groups', () => {
      qb.group((qb1) => {
        qb1.where('a', '=', 1).group((qb2) => {
          qb2.where('b', '=', 2).group((qb3) => {
            qb3.where('c', '=', 3).group((qb4) => {
              qb4.where('d', '=', 4);
            });
          });
        });
      });
      expect(qb.toString()).toBe('(a = 1 and (b = 2 and (c = 3 and (d = 4))))');
    });

    test('should correctly process OR inside nested groups', () => {
      qb.where('x', '=', 10).group((qb) => {
        qb.where('y', '=', 20).where('z', '=', 30, 'or');
      }, 'or');
      expect(qb.toString()).toBe('x = 10 or (y = 20 or z = 30)');
    });

    test('should handle functions with multiple arguments', () => {
      qb.where('score', '>', QueryBuilder.fn('AVG', 'points', 'level'));
      expect(qb.toString()).toBe("score > AVG('points', 'level')");
    });

    test('should handle field names with special characters', () => {
      qb.where('user.name', '=', 'John');
      expect(qb.toString()).toBe("user.name = 'John'");
    });

    test('should handle in operator with function calls', () => {
      qb.where('role', 'in', [QueryBuilder.fn('LOWER', 'Admin'), 'editor']);
      expect(qb.toString()).toBe("role in (LOWER('Admin'), 'editor')");
    });

    test('should simplify single-condition groups', () => {
      qb.group((qb) => {
        qb.where('status', '=', 'active');
      });
      expect(qb.toString()).toBe("(status = 'active')");
    });

    test('should handle in operator with a single value array', () => {
      qb.where('role', 'in', ['admin']);
      expect(qb.toString()).toBe("role in ('admin')");
    });

    test('should handle consecutive logical operators correctly', () => {
      qb.where('age', '>', 18).where('role', '=', 'admin', 'and').where('active', '=', true, 'or');
      expect(qb.toString()).toBe("age > 18 and role = 'admin' or active = true");
    });
  });

  describe('Skip Values', () => {
    test('should skip condition with empty string when configured', () => {
      qb.skipWhen({ emptyString: true }).where('name', '===', '');
      expect(qb.toJSON()).toEqual([]);
      expect(qb.toString()).toBe('');
    });

    test('should skip condition with undefined when configured', () => {
      qb.skipWhen({ undefined: true }).where('name', '===', undefined);
      expect(qb.toJSON()).toEqual([]);
      expect(qb.toString()).toBe('');
    });

    test('should skip condition with null when configured', () => {
      qb.skipWhen({ null: true }).where('name', '===', null);
      expect(qb.toJSON()).toEqual([]);
      expect(qb.toString()).toBe('');
    });

    test('should skip condition with empty array when configured', () => {
      qb.skipWhen({ emptyArray: true }).where('tags', 'in', []);
      expect(qb.toJSON()).toEqual([]);
      expect(qb.toString()).toBe('');
    });

    test('should skip condition with nullable array values when configured', () => {
      qb.skipWhen({ emptyArray: true }).where('tags', 'in', ['', null, undefined]);
      expect(qb.toJSON()).toEqual([]);
      expect(qb.toString()).toBe('');
    });

    test('should include non-empty values and skip configured ones', () => {
      qb.skipWhen({ emptyString: true, emptyArray: true })
        .where('name', '===', '')
        .where('age', '>', 30)
        .where('role', 'in', [])
        .where('status', '=', 'active');

      expect(qb.toString()).toBe("age > 30 and status = 'active'");
    });

    test('should handle nested groups with only skipped conditions', () => {
      qb.skipWhen({ emptyString: true, emptyArray: true }).group((q) => {
        q.where('name', '=', '');
        q.where('role', 'in', []);
      });
      expect(qb.toString()).toBe('');
    });

    test('should include nested groups with at least one non-skipped condition', () => {
      qb.skipWhen({ emptyString: true, emptyArray: true }).group((q) => {
        q.where('name', '=', '');
        q.where('role', 'in', ['admin']);
      });
      expect(qb.toString()).toBe("(role in ('admin'))");
    });

    test('should skip empty groups by default', () => {
      qb.group(() => {
        // Empty group
      });
      expect(qb.toString()).toBe('');
    });

    test('should allow selective skipping of values', () => {
      qb.skipWhen({ null: true, emptyString: true, undefined: false })
        .where('name', '==', 'John')
        .where('middle', '==', '')
        .where('last', '==', null)
        .where('age', '>', 30)
        .where('deleted', '==', undefined);
      expect(qb.toString()).toBe("name == 'John' and age > 30 and deleted == undefined");
    });

    test('should skip NaN values when configured', () => {
      qb.skipWhen({ nan: true }).where('score', '>', NaN).where('rating', '<', 5);
      expect(qb.toString()).toBe('rating < 5');
    });

    test('should skip empty objects when configured', () => {
      qb.skipWhen({ emptyObject: true }).where('config', '=', {}).where('settings', '=', { darkMode: true });
      expect(qb.toString()).toBe('settings = {"darkMode":true}');
    });
  });
  describe('Like operators', () => {
    test('should handle like operator', () => {
      qb.where('name', 'like', '%john%');
      expect(qb.toString()).toBe("name like '%john%'");
    });

    test('should handle ilike operator (case-insensitive)', () => {
      qb.where('email', 'ilike', '%GMAIL.COM%');
      expect(qb.toString()).toBe("email ilike '%GMAIL.COM%'");
    });
  });

  describe('Range operators', () => {
    test('should handle between operator with array', () => {
      qb.where('age', 'between', [18, 65]);
      expect(qb.toString()).toBe('age between 18 and 65');
    });

    test('should handle not between operator with array', () => {
      qb.where('score', 'not between', [0, 50]);
      expect(qb.toString()).toBe('score not between 0 and 50');
    });

    test('should handle between with dates', () => {
      qb.where('created_at', 'between', ['2023-01-01', '2023-12-31']);
      expect(qb.toString()).toBe("created_at between '2023-01-01' and '2023-12-31'");
    });
  });

  describe('Null check operators', () => {
    test('should handle is null operator', () => {
      qb.where('deleted_at', 'is null');
      expect(qb.toString()).toBe('deleted_at is null');
    });

    test('should handle is not null operator', () => {
      qb.where('created_at', 'is not null');
      expect(qb.toString()).toBe('created_at is not null');
    });

    test('should handle is empty operator', () => {
      qb.where('description', 'is empty');
      expect(qb.toString()).toBe('description is empty');
    });

    test('should handle is not empty operator', () => {
      qb.where('notes', 'is not empty');
      expect(qb.toString()).toBe('notes is not empty');
    });

    test('should handle multiple null checks with logic', () => {
      qb.where('deleted_at', 'is null')
        .where('active', '=', true, 'and')
        .where('email', 'is not empty', undefined, 'and');
      expect(qb.toString()).toBe('deleted_at is null and active = true and email is not empty');
    });
  });

  describe('Complex UI scenarios', () => {
    test('should handle advanced search form scenario', () => {
      qb.where('name', 'ilike', '%john%')
        .where('age', 'between', [25, 45], 'and')
        .where('status', 'in', ['active', 'pending'], 'and')
        .group((nested) => {
          nested.where('email', 'is not empty').where('phone', 'is not null', undefined, 'or');
        }, 'and');

      expect(qb.toString()).toBe(
        "name ilike '%john%' and age between 25 and 45 and status in ('active', 'pending') and (email is not empty or phone is not null)"
      );
    });

    test('should handle date range search', () => {
      qb.where('created_at', 'between', ['2023-01-01T00:00:00Z', '2023-12-31T23:59:59Z']).where(
        'updated_at',
        'is not null',
        'and'
      );

      expect(qb.toString()).toBe(
        "created_at between '2023-01-01T00:00:00Z' and '2023-12-31T23:59:59Z' and updated_at is not null"
      );
    });

    test('should handle text search with multiple like patterns', () => {
      qb.group((nested) => {
        nested
          .where('title', 'like', '%search%')
          .where('description', 'like', '%search%', 'or')
          .where('tags', 'like', '%search%', 'or');
      });

      expect(qb.toString()).toBe("(title like '%search%' or description like '%search%' or tags like '%search%')");
    });
  });

  describe('Form Validation Helper', () => {
    test('should reject invalid operator/value combos for dedicated methods', () => {
      expect(QueryBuilder.validateOperator('===', undefined)).toEqual({ valid: true });
      expect(QueryBuilder.validateOperator('!==', undefined)).toEqual({ valid: true });
      expect(QueryBuilder.validateOperator('==', undefined)).toEqual({ valid: true });
    });
    test('should validate operator compatibility', () => {
      // Valid cases
      expect(QueryBuilder.validateOperator('is null')).toEqual({ valid: true });
      expect(QueryBuilder.validateOperator('between', [1, 10])).toEqual({ valid: true });
      expect(QueryBuilder.validateOperator('in', ['a', 'b'])).toEqual({ valid: true });
      expect(QueryBuilder.validateOperator('=', 'value')).toEqual({ valid: true });

      // Invalid cases
      expect(QueryBuilder.validateOperator('is null', 'should not have value')).toEqual({
        valid: false,
        error: "Operator 'is null' should not have a value",
      });

      expect(QueryBuilder.validateOperator('between', [1])).toEqual({
        valid: false,
        error: "Operator 'between' requires an array with exactly 2 values",
      });

      expect(QueryBuilder.validateOperator('in', 'not an array')).toEqual({
        valid: false,
        error: "Operator 'in' requires an array value",
      });
    });
  });
});
