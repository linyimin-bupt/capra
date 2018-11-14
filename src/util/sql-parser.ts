const parse     = require('node-sqlparser').parse
const stringify = require('node-sqlparser').stringify

interface AST {
  type    : string,                       // Type of operation(select, insert, update...)
  distinct: string | null,                // keyword distinct
  columns : string | ASTColumnObj[],      // The query result set
  from    : FieldFrom[]                   // Where data from
  where   : any,                          // Query condition
  groupby : any,                          // keyword group by
  orderby : any,
  limit   : ExprConstObj[],               // The limit condition
  params  : any[],
}

interface ASTColumnObj {
  expr: {
    type : string,                        // field type(aggr_func, column_ref)
    name?: string,                        // func name
    args?: {                              // args of function
      expr: ExprConstObj | ExprFieldObj   // Type of args
    },
    table? : string,                      // The table of fied
    column?: string,                      // The field name
  },
  as: string,                             // alias
}

interface ExprFieldObj {
  type  : string,                         // column_ref
  table : string,                         // The table of field
  column: string,                         // The name of field
}

interface ExprConstObj {
  type : string,                          // Const variable type
  value: string,                          // Const variable value
}
interface RawResponseFieldObj {
  name  : string,
  type  : string,
  alias?: string,
}

interface FieldFrom {
  db   : string,                          // The database field belongs to
  table: string,                          // The table field belongs to
  as   : string,                          // The alias of field
}


interface FieldObj {
  table       : string,                   // The table field belongs to
  column      : string,                   // The field name
  defaultValue: string | string[],        // The field default value
}
/**
 *
 * @param ast
 * public api
 */
export function parseColumns(sql: string): RawResponseFieldObj[] {
  const ast: AST = parse(sql)
  const columns  = ast.columns
  if (typeof columns === 'string') {
    return [{ name: '*', type: 'column' }]
  }
  const responseParameter = columns.map((column: ASTColumnObj, i: number) => {
    let name = ''
    /**
     * If the field is function, type is others
     * If the field is column of table, type is column
     */
    let type = 'others'
    let alias = ''
    if (column.as) {
      alias = column.as
    }
    if (column.expr.type === 'aggr_func') {
      name = column.expr.name!.toLowerCase()
      if (column.expr.args!.expr.type === 'column_ref') {
        const expr = column.expr.args!.expr as ExprFieldObj
        name += '_' + expr.column!
      } else {
        name += '_' + i
      }
    } else if (column.expr.type === 'column_ref') {
      name = column.expr.column!
      type = 'column'
    }
    return { name, type, alias }
  })
  return responseParameter
}

/**
 *
 * @param sql
 */
export function parseFrom(sql: string): FieldFrom[] {
  const ast: AST = parse(sql)
  return ast.from
}

/**
 *
 * @param sql
 */
export function parseWhere(sql: string): FieldObj[] {
  const ast: AST = parse(sql)
  const fieldObj = new Array<FieldObj>()
  __parseWhere(ast.where, fieldObj)
  return fieldObj

}

/**
 *
 * @param sql
 */
export function parseLimit(sql: string): {value: number | null} {
  const ast = parse(sql)
  const limit = ast.limit
  if (!limit) {
    return { value: null}
  }
  return {value: parseInt(limit[1].value)}
}

/**
 *
 * @param sql
 */
export function sqlParameterized(sql: string): string {
  const ast: AST = parse(sql)
  __sqlParameterized(ast.where)
  if (typeof ast.limit === 'object') {
    ast.limit.map((value: any, i) => {
      if (i === 0) {
        value.value = ''
      } else {
        value.value = '?'
      }
    })
  }
  return stringify(ast).replace(/'/g, '')
}


function __parseWhere(where: any, fieldObj: FieldObj[]) {
  if (where.left.type === 'column_ref') {
    let value = new Array()
    if (typeof where.right.value === 'object') {
      value = where.right.value.map((value: any) => {
        return value.value
      })
    } else {
      value = where.right.value
    }
    const field: FieldObj = {
      table: where.left.table,
      column: where.left.column,
      defaultValue: value
    }
    fieldObj.push(field)
    return
  }
  __parseWhere(where.left, fieldObj)
  __parseWhere(where.right, fieldObj)
}

function __sqlParameterized(where: any) {
  if (where.left.type === 'column_ref') {
    if (typeof where.right.value === 'object') {
      where.right.value.map((value: any) => {
        value.value = '?'
      })
    } else {
      where.right.value = '?'
    }
    return
  }
  __sqlParameterized(where.left)
  __sqlParameterized(where.right)
}
