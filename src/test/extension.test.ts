import { suite, test } from 'mocha';
import * as assert from 'assert';
import { processText } from '../utils';

suite('processText – format', () => {

    test('formats a JSON object', () => {
        const input    = '{"a":1,"b":2}';
        const expected = `{
  "a": 1,
  "b": 2
}`;
        assert.strictEqual(processText(input, 'format', 2), expected);
    });

    test('formats a JSON array', () => {
        const input    = '[1,2,3]';
        const expected = `[
  1,
  2,
  3
]`;
        assert.strictEqual(processText(input, 'format', 2), expected);
    });

    test('formats JSONL (each object separated by blank line)', () => {
        const input    = '{"a":1}\n{"b":2}';
        const expected = `{
  "a": 1
}

{
  "b": 2
}`;
        assert.strictEqual(processText(input, 'format', 2), expected);
    });

    test('throws on invalid input', () => {
        assert.throws(() => processText('not json', 'format', 2));
    });
});

suite('processText – minify', () => {

    test('minifies a JSON object', () => {
        const input    = `{
  "a": 1,
  "b": 2
}`;
        const expected = '{"a":1,"b":2}';
        assert.strictEqual(processText(input, 'minify', 2), expected);
    });

    test('minifies a JSON array', () => {
        const input    = `[
  1,
  2,
  3
]`;
        const expected = '[1,2,3]';
        assert.strictEqual(processText(input, 'minify', 2), expected);
    });

    test('minifies JSONL (each line joined by newline)', () => {
        const input    = '{"a":1}\n{"b":2}';
        const expected = '{"a":1}\n{"b":2}';
        assert.strictEqual(processText(input, 'minify', 2), expected);
    });

    test('minifies JSONL with some spaces (each line joined by newline)', () => {
        const input    = '{"a": 1}\n{"b": 2 }';
        const expected = '{"a":1}\n{"b":2}';
        assert.strictEqual(processText(input, 'minify', 2), expected);
    });

    test('throws on invalid input', () => {
        assert.throws(() => processText('not json', 'minify', 2));
    });
});

suite('processText – toJsonl', () => {

    test('converts a JSON array to JSONL', () => {
        const input    = '[{"a":1},{"b":2}]';
        const expected = '{"a": 1}\n{"b": 2}';
        assert.strictEqual(processText(input, 'toJsonl', 2), expected);
    });

    test('converts a JSON object to JSONL', () => {
        const input    = `{
  "a": 1,
  "b": 2
}`;
        const expected = '{"a": 1,"b": 2}';
        assert.strictEqual(processText(input, 'toJsonl', 2), expected);
    });

    test('converts a formatted JSONL (each object separated by blank line) back to JSONL', () => {
        const input = `{
  "a": 1
}

{
  "b": 2
}`;
        const expected = '{"a": 1}\n{"b": 2}';
        assert.strictEqual(processText(input, 'toJsonl', 2), expected);
    });

    test('converts a formatted JSONL (each object separated by blank line) with mixed newline back to JSONL', () => {
        const input = `{
  "a": 1
}

{
  "b": 2
}
{
  "c": 3
}`;
        const expected = '{"a": 1}\n{"b": 2}\n{"c": 3}';
        assert.strictEqual(processText(input, 'toJsonl', 2), expected);
    });

    test('throws when input is already JSONL (no fallback)', () => {
        assert.throws(() => processText('{"a":1}\n{"b":2}', 'toJsonl', 2));
    });

    test('throws on invalid input', () => {
        assert.throws(() => processText('not json', 'toJsonl', 2));
    });
});
