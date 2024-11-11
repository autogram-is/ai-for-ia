import is from '@sindresorhus/is';
import { parse, Options as ParseOptions } from 'csv-parse/sync';
import { stringify, Options as StringifyOptions } from 'csv-stringify/sync';

export const ndjson = {
  parse(data: string) {
    const lines = data.trim().split('\n');
    return lines.map((line: string) => JSON.parse(line));
  },

  stringify(data: unknown[]) {
    return data
      .map((item: unknown) => JSON.stringify(item, void 0, 0))
      .join('\n');
  },
};

const parseOptions: ParseOptions = {
  cast: true,
  groupColumnsByName: true,
  relaxColumnCountLess: true,
  skipEmptyLines: true,
  trim: true,
};

export const csv = {
  parse: (data: string, columns: boolean = true) => {
    return parse(data, { ...parseOptions, delimiter: ',', columns });
  },
  stringify: (input: unknown[], options: StringifyOptions = {}) => {
    return stringify(input, {
      objectMode: is.plainObject(input[0]),
      header: is.plainObject(input[0]),
      delimiter: ',',
      ...options
    });
  },
};

export const tsv = {
  parse: (data: string, columns: boolean = true) => {
    return parse(data, { ...parseOptions, delimiter: '\t', columns });
  },
  stringify: (input: unknown[], options: StringifyOptions = {}) => {
    return stringify(input, {
      objectMode: is.plainObject(input[0]),
      header: is.plainObject(input[0]),
      delimiter: '\t',
      ...options
    });
  },
};
