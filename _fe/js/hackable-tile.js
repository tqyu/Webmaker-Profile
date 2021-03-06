define([
  'jquery',
  'js/render',
  'imagesloaded',
  'js/tile'
], function ($, render, imagesLoaded, Tile) {

  var HackableTile = function (target, options) {
    var self = this;
    var defaults;
    var option;

    self.callbacks = {};

    self.mediaURLRegEx = {
      'YouTube': /^.*v=([a-zA-Z0-9_-]+).*$/,
      'Vimeo': /^.*\/([0-9]+).*/
    };

    // Options ----------------------------------------------------------------

    defaults = {};

    for (option in options) {
      defaults[option] = options[option] || defaults[option];
    }

    self.options = defaults;

    // Element references -----------------------------------------------------

    self.$wrapper = $(target);
    self.$tileContent = $(render('hackable-tile'));
    self.$textarea = self.$tileContent.filter('textarea');
    self.$hackedContent = self.$tileContent.filter('.hacked-content');
    self.$hackButton = self.$tileContent.filter('.hack');
    self.$saveButton = self.$tileContent.filter('.save');

    // Properties -------------------------------------------------------------

    // Setup ------------------------------------------------------------------

    self.$wrapper.html(self.$tileContent);
    self.bindCommonUI(self.$wrapper);

    // Event Delegation -------------------------------------------------------

    self.$saveButton.on('click', function () {
      self.showMake();
    });

    self.$hackButton.on('click', function () {
      self.showEditor();
    });
  };

  HackableTile.prototype = new Tile();

  /**
   * Enter edit mode
   * @return {undefined}
   */
  HackableTile.prototype.enterEditMode = function () {
    var self = this;

    self.showDeleteButton();
    self.$hackButton.show();
  };

  /**
   * Exit edit mode
   * @return {undefined}
   */
  HackableTile.prototype.exitEditMode = function () {
    var self = this;

    self.showMake();
    self.hideDeleteButton();
    self.$hackButton.hide();
  };

  /**
   * Show the tile editor UI
   * @return {undefined}
   */
  HackableTile.prototype.showEditor = function () {
    var self = this;

    self.$hackButton.addClass('disabled');
    self.$textarea.show();
    self.$saveButton.show();
    self.$textarea.focus();
    self.fire('resize');
  };
  /**
   * Show the tile editor UI
   * @return {undefined}
   */
  HackableTile.prototype.showEditor = function () {
    var self = this;

    self.$hackButton.addClass('disabled');
    self.$textarea.show();
    self.$saveButton.show();
    self.$textarea.focus();
    self.fire('resize');
  };

  /**
   * Show the rendered HTML from the editor
   * @return {undefined}
   */
  HackableTile.prototype.showMake = function () {
    var self = this;

    self.update(self.$textarea.val());
    self.$hackButton.removeClass('disabled');
    self.$textarea.hide();
    self.$hackButton.show();
    self.$saveButton.hide();
    self.$hackedContent.show();
  };

  HackableTile.prototype.getContent = function () {
    var self = this;

    return self.$hackedContent.html().length ? self.$hackedContent.html() : null;
  };

  /**
   * Update the rendered HTML inside the tile
   * @param  {string} html A string of HTML/text to parse and render
   * @return {undefined}
   */
  HackableTile.prototype.update = function (html) {
    var self = this;

    function wrapImg(text) {
      return '<img src="' + text + '">';
    }

    function wrapYoutube(url) {
      var id = url.match(self.mediaURLRegEx.YouTube);
      if (id) {
        id = id[1]; // second result in array is the ID if there is a match
        var $container = $('<div class="video-container">').append($('<iframe ' +
          'type="text/html" src="http://www.youtube.com/embed/' + id + '">'));
        return $container;
      }
    }

    function wrapVimeo(url) {
      var id = url.match(self.mediaURLRegEx.Vimeo);
      if (id) {
        id = id[1]; // second result in array is the ID if there is a match
        var $container = $('<div class="video-container">').append($('<iframe ' +
          'type="text/html" src="http://player.vimeo.com/video/' + id + '" ' +
          'webkitAllowFullScreen mozallowfullscreen allowFullScreen>'));
        return $container;
      }
    }

    if (html.length) {
      // Fire resize when all inserted images load
      imagesLoaded(self.$hackedContent, function () {
        self.fire('resize');
      });

      // Wrap Image URL in IMG tag
      if (html.match(/(.jpg|.png|.gif)$/)) {
        html = wrapImg(html);
      } else if (html.match(/youtube/)) {
        html = wrapYoutube(html)[0];

        $(html).data('aspectRatio', html.height / html.width)
          .removeAttr('height')
          .removeAttr('width');
      } else if (html.match(/vimeo/)) {
        html = wrapVimeo(html);

        $(html).data('aspectRatio', html.height / html.width)
          .removeAttr('height')
          .removeAttr('width');
      }

      self.$hackedContent.show();
    } else {
      self.$hackedContent.hide();
    }

    self.$hackedContent.html(html);
    self.$textarea.val(html);

    // This method extends Tile's update method
    // Calling here so that events fire after updates have actually occurred
    Tile.prototype.update.call(self, html);

  };

  return HackableTile;
});
