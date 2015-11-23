var ViewList = require('view-list')
var extend = require('extend')
var inherits = require('inherits')
var fields = require('data-fields')

function RowsView (options) {
  if (!(this instanceof RowsView)) return new RowsView(options)
  var rowHeight = options.rowHeight || 30
  var height = window.innerHeight - rowHeight
  ViewList.call(this, options)

  extend(this, {
    className: 'data-list-rows readonly',
    rowHeight: rowHeight,
    eachrow: function rows (row) {
      var self = this
      if (!row) return
      if (!row.key) row.key = row.id
      if (!row.value) row.value = row.properties || {}
      var properties = Object.keys(row.value)
      var elements = properties.map(element)

      function element (key) {
        var prop = self.properties[key]
        var type = prop.type[0]
        if (type === 'undefined') type = 'string'

        function onfocus (e) {
          self.send('focus', e, row, key, row.value[key])
        }

        function onblur (e) {
          self.send('blur', e, row, key, row.value[key])
        }

        function onclick (e) {
          self.send('click', e, row, key, row.value[key])
        }

        function oninput (e) {
          row.value[key] = e.target.value
          self.send('input', e, row, key, row.value[key])
        }

        var value = row.value[key]

        var propertyOptions = {
          value: value,
          id: 'cell-' + row.key + '-' + key,
          attributes: {
            'data-type': 'string', // todo: use property type from options.properties
            'data-key': key,
            rows: 1
          },
          onfocus: onfocus,
          onblur: onblur,
          onclick: onclick,
          oninput: oninput
        }

        if (self.readonly) {
          propertyOptions.attributes.readonly = true
        }

        var h = self.html
        var field = fields[type]()
        return field.render(h, propertyOptions, value)
      }

      var rowOptions = { attributes: { 'data-key': row.key } }

      if (row.active) {
        rowOptions.className = 'active'
        rowOptions.attributes['data-active'] = 'true'
      }

      return self.html('li.data-list-row', rowOptions, [
        self.html('.data-list-row-items', elements)
      ])
    },
    readonly: true,
    properties: {},
    height: height
  }, options)
}

module.exports = RowsView
inherits(RowsView, ViewList)

RowsView.prototype.render = function rowsview_render (state) {
  this.properties = state.properties
  var view = ViewList.prototype.render.call(this, state.data)
  return this.afterRender(view)
}
