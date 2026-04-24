declare module "better-sqlite3" {
  interface Statement { run(...params: any[]): { lastInsertRowid: number | bigint; changes: number }; get(...params: any[]): any; all(...params: any[]): any[]; }
  class Database { constructor(filename: string, options?: any); prepare(sql: string): Statement; exec(sql: string): void; pragma(pragma: string): any; close(): void; }
  export = Database;
}
