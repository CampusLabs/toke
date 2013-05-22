(function () {
  'use strict';

  // Store a local reference to jQuery and Underscorea.
  var $ = window.jQuery;
  var _ = window._;
  var Backbone = window.Backbone;
  var Rec = window.Rec;

  window.Toke = Backbone.View.extend({

    // Override these template functions to return your labels and results the
    // way you want them. If you are not using the `groupBy` option,
    // `labelTemplate` will be ignored.
    tokenTemplate: function (result) {
      return "<div class='js-toke-remove'>" + result + '</div>';
    },

    // Define a Backbone collection to use for storing tokens.
    Collection: Backbone.Collection,

    initialize: function (options) {
      _.extend(this, options);
      this.views = {};
      var selected = this.selected = new this.Collection();

      // Modify the filter so that results that have already been added as
      // tokens are not displayed.
      var filter = options.filter || Rec.prototype.filter;
      options.filter = function (q, result) {
        return !selected.get(result) && filter(q, result);
      };

      // Modify the result template so that results are added as tokens.
      var resultTemplate =
        options.resultTemplate || Rec.prototype.resultTemplate;
      options.resultTemplate = function (result) {
        var el = resultTemplate(result);
        var $el = el instanceof $ ? el : $(el);
        return $el.click(function () { selected.add(result); });
      };
      this.listenTo(selected, {
        add: function (token) {
          (this.views[token.id] = new TokeToken({
            model: token,
            template: this.tokenTemplate,
            collection: selected
          })).render().$el.appendTo(this.$('.js-toke-container'));
          this.rec.render();
        },
        remove: function (token) {
          delete this.views[token.id];
          this.rec.render();
        }
      });
      this.selected.add(options.selected);
      this.rec = new Rec(options);
    }
  });

  var TokeToken = Backbone.View.extend({
    className: 'js-toke-token',

    events: {
      'click .js-toke-remove': 'remove'
    },

    initialize: function (options) {
      this.template = options.template;
    },

    render: function () {
      this.$el.html(this.template(this.model));
      return this;
    },

    remove: function () {
      this.collection.remove(this.model);
      return Backbone.View.prototype.remove.apply(this, arguments);
    }
  });
})();
