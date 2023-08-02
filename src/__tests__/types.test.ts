import { num2bytes, num2str, str2num } from '../types';

describe('test type mappings', () => {
  test('number to string', () => {
    expect(num2str(1)).toBe('byte');
    expect(num2str(2)).toBe('char');
    expect(num2str(3)).toBe('short');
    expect(num2str(4)).toBe('int');
    expect(num2str(5)).toBe('float');
    expect(num2str(6)).toBe('double');
    expect(num2str(7)).toBe('undefined');
  });
  test('num to bytes', () => {
    expect(num2bytes(1)).toBe(1);
    expect(num2bytes(2)).toBe(1);
    expect(num2bytes(3)).toBe(2);
    expect(num2bytes(4)).toBe(4);
    expect(num2bytes(5)).toBe(4);
    expect(num2bytes(6)).toBe(8);
    expect(num2bytes(7)).toBe(-1);
  });
  test('string to number', () => {
    expect(str2num('byte')).toBe(1);
    expect(str2num('char')).toBe(2);
    expect(str2num('short')).toBe(3);
    expect(str2num('int')).toBe(4);
    expect(str2num('float')).toBe(5);
    expect(str2num('double')).toBe(6);
    expect(str2num('undefined')).toBe(-1);
  });
});
