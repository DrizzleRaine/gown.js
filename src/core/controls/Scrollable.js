var Skinable = require('../Skinable'),
    ScrollThumb = require('./ScrollThumb');
/**
 * scroll bar or slider
 * @class Scrollable
 * @extends PIXI_UI.Scrollable
 * @memberof PIXI_UI
 * @constructor
 */

function Scrollable(thumb, theme) {
    this.mode = this.mode || Scrollable.DESKTOP_MODE;

    Skinable.call(this, theme);

    this.orientation = this.orientation || Scrollable.HORIZONTAL;

    this.thumb = thumb || new ScrollThumb(this, theme);
    this.addChild(this.thumb);

    this.invalidTrack = true;
    this._inverse = false;
    this._start = null;

    // # of pixel you scroll at a time (if the event delta is 1 / -1)
    this.scrolldelta = 10;
}

Scrollable.prototype = Object.create( Skinable.prototype );
Scrollable.prototype.constructor = Scrollable;
module.exports = Scrollable;


Scrollable.DESKTOP_MODE = 'desktop';
Scrollable.MOBILE_MODE = 'mobile';

Scrollable.HORIZONTAL = 'horizontal';
Scrollable.VERTICAL = 'vertical';

Scrollable.prototype.handleDown = function(mouseData) {
    var local = mouseData.getLocalPosition(this);
    this._start = [local.x, local.y];
};

Scrollable.prototype.handleUp = function() {
    this._start = null;
};

/**
 * handle mouse move: move thumb
 * @param mouseData
 */
Scrollable.prototype.handleMove = function(mouseData) {
    if (this._start) {
        var local = mouseData.getLocalPosition(this);
        var x = this.thumb.x + local.x - this._start[0];
        var y = this.thumb.y + local.y - this._start[1];
        if (this.moveThumb(x, y)) {
            // do not override localX/localY in start
            // if we do not move the thumb
            this.thumbMoved(x, y);
            this._start[0] = local.x;
            this._start[1] = local.y;
        }
    }
};


Scrollable.prototype.handleWheel = function (event) {
    var x = this.thumb.x - event.delta * this.scrolldelta;
    var y = this.thumb.y - event.delta * this.scrolldelta;
    if (this.moveThumb(x, y)) {
        this.thumbMoved(x, y);
    }
};

/**
 * thumb has new x/y position
 * @param x x-position that has been scrolled to (ignored when vertical)
 * @param y y-position that has been scrolled to (ignored when horizontal)
 */
/* jshint unused: false */
Scrollable.prototype.thumbMoved = function(x, y) {
};

Scrollable.prototype._updateProgressSkin = function() {
    if (!this.progressSkin) {
        return;
    }
    if(this.orientation === Scrollable.HORIZONTAL) {
        var progressPosX = this.thumb.x + this.thumb.width / 2;
        if (this.inverse) {
            this.progressSkin.x = progressPosX;
            this.progressSkin.width = this.width - progressPosX;
            this.progressSkin.height = this.skin.height;
        } else {
            this.progressSkin.x = 0;
            this.progressSkin.width = progressPosX;
            this.progressSkin.height = this.skin.height;
        }
    } else {
        var progressPosY = this.thumb.y + this.thumb.height / 2;
        if (this.inverse) {
            this.progressSkin.y = progressPosY;
            this.progressSkin.height = this.height - progressPosY;
            this.progressSkin.width = this.skin.width;
        } else {
            this.progressSkin.y = 0;
            this.progressSkin.height =progressPosY;
            this.progressSkin.width = this.skin.width;
        }
    }
};

/**
 * returns the max. width in pixel
 * (normally this.width - thumb width)
 */
Scrollable.prototype.maxWidth = function() {
    return this.width - this.thumb.width;
};

/**
 * returns the max. height in pixel
 * (normally this.height - thumb height)
 */
Scrollable.prototype.maxHeight = function() {
    return this.height - this.thumb.height;
};

/**
 * move the thumb on the scroll bar within its bounds
 * @param x new calculated x position of the thumb
 * @param y new calculated y position of the thumb
 * @returns {boolean} returns true if the position of the thumb has been
 * moved
 */
Scrollable.prototype.moveThumb = function(x, y) {
    if(this.orientation === Scrollable.HORIZONTAL) {
        if (isNaN(x)) {
            return false;
        }
        x = Math.min(x, this.maxWidth());
        x = Math.max(x, 0);
        if (x !== this.thumb.x) {
            this.thumb.x = x;
            this._updateProgressSkin();
            return true;
        }
    } else {
        if (isNaN(y)) {
            return false;
        }
        y = Math.min(y, this.maxHeight());
        y = Math.max(y, 0);
        if (y !== this.thumb.y) {
            this.thumb.y = y;
            this._updateProgressSkin();
            return true;
        }
    }
    return false;
};

Scrollable.prototype.showTrack = function(skin) {
    if (this.skin !== skin) {
        if(this.skin) {
            this.removeChild(this.skin);
        }

        this.addChildAt(skin, 0);
        this.skin = skin;
        if (this.progressSkin) {
            this._updateProgressSkin();
        }
    }
};

Scrollable.prototype.showProgress = function(skin) {
    if (this.progressSkin !== skin) {
        if(this.progressSkin) {
            this.removeChild(this.progressSkin);
        }
        skin.width = skin.height = 0;
        this.addChildAt(skin, 0);
        this.progressSkin = skin;
        if (this.skin) {
            this._updateProgressSkin();
        }
    }
};

Scrollable.prototype.redraw = function() {
    if (this.invalidTrack && this.thumb) {
        this.fromSkin(this.orientation+'_progress', this.showProgress);
        this.fromSkin(this.orientation+'_track', this.showTrack);
        if (this.skin) {
            if (this.orientation === Scrollable.HORIZONTAL) {
                this.skin.width = this.width;
            } else {
                this.skin.height = this.height;
            }
            this.invalidTrack = false;
        }
    }
};


/**
 * The width of the Scrollable, setting this will redraw the track and thumb.
 * (set invalidDimensions)
 *
 * @property width
 * @type Number
 */
Object.defineProperty(Scrollable.prototype, 'width', {
    get: function() {
        return this._width;
    },
    set: function(width) {
        this._width = width;
        this.invalidTrack = true;
        if (this.thumb) {
            this.thumb.invalidTrack = true;
        }
    }
});

/**
 * Inverse the progress bar
 *
 * @property inverse
 * @type Boolean
 */
Object.defineProperty(Scrollable.prototype, 'inverse', {
    get: function() {
        return this._inverse;
    },
    set: function(inverse) {
        if (inverse !== this._inverse) {
            this._inverse = inverse;

            if (this.orientation === Scrollable.HORIZONTAL) {
                this.moveThumb(0, this.width - this.thumb.x);
            } else {
                this.moveThumb(0, this.height - this.thumb.y);
            }

            this.invalidTrack = true;
            if (this.thumb) {
                this.thumb.invalidTrack = true;
            }
        }
    }
});

/**
 * The height of the Scrollable, setting this will redraw the track and thumb.
 * (set invalidDimensions)
 *
 * @property height
 * @type Number
 */
Object.defineProperty(Scrollable.prototype, 'height', {
    get: function() {
        return this._height;
    },
    set: function(height) {
        this._height = height;
        this.invalidTrack = true;
        if (this.thumb) {
            this.thumb.invalidTrack = true;
        }
    }
});