import { QueryBuilder } from './index';

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
      qb.where('deleted', '===', null);
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
      qb.where('name', '===', '');
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

    test('should skip arrays with empty values', () => {
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
        .where('name', '==', 'John') // Included
        .where('middle', '==', '') // Skipped
        .where('last', '==', null) // Skipped
        .where('age', '>', 30) // Included
        .where('deleted', '==', undefined); // Included (since undefined skipping is false by default)

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
});
