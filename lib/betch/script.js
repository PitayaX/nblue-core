const defaultMetas = {
  $version: '1.0.2',
  $engine: 'nblue',
  $args: {}
}

class Script
{

  constructor (metas, body) {
    this._metas = {}
    this._body = body

    Object.assign(this._metas, defaultMetas)
    if (metas) {
      Object.assign(this._metas, metas)
    }
  }

  get Metas () {
    return this._metas
  }

  get Body () {
    return this._body
  }

  init (ctx) {
    const that = this
    const metas = this.Metas
    const args = metas.$args
    const ctxArgs = ctx.$args || {}

    for (const [key, arg] of Object.entries(args)) {
      if (!ctxArgs[key]) {
        // set default value to argument
        if (typeof arg === 'object') {
          ctxArgs[key] = arg.default ? arg.default : null
        } else {
          ctxArgs[key] = arg
        }
      }

      // check type
      if (arg.type) {
        try {
          if (ctxArgs[key]) {
            // get valuue form args
            const val = ctxArgs[key]

            // set converted value to args
            ctxArgs[key] = that.convertArg(val, arg.type)
          }
        } catch (err) {
          throw new Error(`invalid type for arg: ${key}`)
        }
      }
    }

    ctx.$args = ctxArgs
  }

  convertArg (val, type) {
    let rt = val

    switch (type.toLowerCase()) {
    case 'date':
      rt = typeof val === 'number' ? new Date(val) : Date.parse(val)
      if (isNaN(rt)) throw new Error('invalid date')
      break
    case 'int':
    case 'integer':
      rt = Number.parseInt(val, 10)
      if (isNaN(rt)) throw new Error('invalid integer')
      break
    case 'float':
    case 'double':
    case 'number':
      rt = Number.parseFloat(val, 10)
      if (isNaN(rt)) throw new Error('invalid number')
      break
    default:
      break
    }

    return rt
  }
  static parse (val) {
    try {
      if (typeof val !== 'object') {
        return new Script(null, val)
      }

      if (val.$metas) {
        const metas = val.$metas

        Reflect.deleteProperty(val, '$metas')

        return new Script(metas, val)
      }

      return new Script(null, val)
    } catch (err) {
      throw new Error(`parse script failed, details: ${err.message}`)
    }
  }

}

module.exports = Script
