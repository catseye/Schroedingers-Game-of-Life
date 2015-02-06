/*
 * This file is part of yoob.js version 0.6
 * Available from https://github.com/catseye/yoob.js/
 * This file is in the public domain.  See http://unlicense.org/ for details.
 */
if (window.yoob === undefined) yoob = {};

/*
 * A two-dimensional Cartesian grid of values.
 */
yoob.Playfield = function() {
    this._store = {};
    this.minX = undefined;
    this.minY = undefined;
    this.maxX = undefined;
    this.maxY = undefined;
    this._default = undefined;

    /*
     * Set the default value for this Playfield.  This
     * value is returned by get() for any cell that was
     * never written to, or had `undefined` put() into it.
     */
    this.setDefault = function(v) {
        this._default = v;
        return this;
    };

    /*
     * Obtain the value at (x, y).  The default value will
     * be returned if the cell was never written to.
     */
    this.get = function(x, y) {
        var v = this._store[x+','+y];
        if (v === undefined) return this._default;
        return v;
    };

    /*
     * Write a new value into (x, y).  Note that writing
     * `undefined` into a cell has the semantics of deleting
     * the value at that cell; a subsequent get() for that
     * location will return this Playfield's default value.
     */
    this.put = function(x, y, value) {
        var key = x+','+y;
        if (value === undefined || value === this._default) {
            delete this._store[key];
            return;
        }
        if (this.minX === undefined || x < this.minX) this.minX = x;
        if (this.maxX === undefined || x > this.maxX) this.maxX = x;
        if (this.minY === undefined || y < this.minY) this.minY = y;
        if (this.maxY === undefined || y > this.maxY) this.maxY = y;
        this._store[key] = value;
    };

    /*
     * Like put(), but does not update the playfield bounds.  Do
     * this if you must do a batch of put()s in a more efficient
     * manner; after doing so, call recalculateBounds().
     */
    this.putDirty = function(x, y, value) {
        var key = x+','+y;
        if (value === undefined || value === this._default) {
            delete this._store[key];
            return;
        }
        this._store[key] = value;
    };

    /*
     * Recalculate the bounds (min/max X/Y) which are tracked
     * internally to support methods like foreach().  This is
     * not needed *unless* you've used putDirty() at some point.
     * (In which case, call this immediately after your batch
     * of putDirty()s.)
     */
    this.recalculateBounds = function() {
        this.minX = undefined;
        this.minY = undefined;
        this.maxX = undefined;
        this.maxY = undefined;

        for (var cell in this._store) {
            var pos = cell.split(',');
            var x = parseInt(pos[0], 10);
            var y = parseInt(pos[1], 10);
            if (this.minX === undefined || x < this.minX) this.minX = x;
            if (this.maxX === undefined || x > this.maxX) this.maxX = x;
            if (this.minY === undefined || y < this.minY) this.minY = y;
            if (this.maxY === undefined || y > this.maxY) this.maxY = y;
        }
    };

    /*
     * Clear the contents of this Playfield.
     */
    this.clear = function() {
        this._store = {};
        this.minX = undefined;
        this.minY = undefined;
        this.maxX = undefined;
        this.maxY = undefined;
    };

    /*
     * Scroll a rectangular subrectangle of this Playfield, up.
     * TODO: support other directions.
     */
    this.scrollRectangleY = function(dy, minX, minY, maxX, maxY) {
        if (dy < 1) {
            for (var y = minY; y <= (maxY + dy); y++) {
                for (var x = minX; x <= maxX; x++) {
                    this.put(x, y, this.get(x, y - dy));
                }
            }
        } else { alert("scrollRectangleY(" + dy + ") notImplemented"); }
    };

    this.clearRectangle = function(minX, minY, maxX, maxY) {
        // Could also do this with a foreach that checks
        // each position.  Would be faster on sparser playfields.
        for (var y = minY; y <= maxY; y++) {
            for (var x = minX; x <= maxX; x++) {
                this.put(x, y, undefined);
            }
        }
    };

    /*
     * Load a string into this Playfield.
     * The string may be multiline, with newline (ASCII 10)
     * characters delimiting lines.  ASCII 13 is ignored.
     *
     * If transformer is given, it should be a one-argument
     * function which accepts a character and returns the
     * object you wish to write into the playfield upon reading
     * that character.
     */
    this.load = function(x, y, string, transformer) {
        var lx = x;
        var ly = y;
        if (transformer === undefined) {
            transformer = function(c) {
                if (c === ' ') {
                    return undefined;
                } else {
                    return c;
                }
            }
        }
        for (var i = 0; i < string.length; i++) {
            var c = string.charAt(i);
            if (c === '\n') {
                lx = x;
                ly++;
            } else if (c === '\r') {
            } else {
                this.putDirty(lx, ly, transformer(c));
                lx++;
            }
        }
        this.recalculateBounds();
    };

    /*
     * Convert this Playfield to a multi-line string.  Each row
     * is a line, delimited with a newline (ASCII 10).
     *
     * If transformer is given, it should be a one-argument
     * function which accepts a playfield element and returns a
     * character (or string) you wish to place in the resulting
     * string for that element.
     */
    this.dump = function(transformer) {
        var text = "";
        if (transformer === undefined) {
            transformer = function(c) { return c; }
        }
        for (var y = this.minY; y <= this.maxY; y++) {
            var row = "";
            for (var x = this.minX; x <= this.maxX; x++) {
                row += transformer(this.get(x, y));
            }
            text += row + "\n";
        }
        return text;
    };

    /*
     * Iterate over every defined cell in the Playfield.
     * fun is a callback which takes three parameters:
     * x, y, and value.  If this callback returns a value,
     * it is written into the Playfield at that position.
     * This function ensures a particular order.
     */
    this.foreach = function(fun) {
        for (var y = this.minY; y <= this.maxY; y++) {
            for (var x = this.minX; x <= this.maxX; x++) {
                var key = x+','+y;
                var value = this._store[key];
                if (value === undefined)
                    continue;
                var result = fun(x, y, value);
                if (result !== undefined) {
                    if (result === ' ') {
                        result = undefined;
                    }
                    this.put(x, y, result);
                }
            }
        }
    };

    /*
     * Analogous to (monoid) map in functional languages,
     * iterate over this Playfield, transform each value using
     * a supplied function, and write the transformed value into
     * a destination Playfield.
     *
     * Supplied function should take a Playfield (this Playfield),
     * x, and y, and return a value.
     *
     * The map source may extend beyond the internal bounds of
     * the Playfield, by giving the min/max Dx/Dy arguments
     * (which work like margin offsets.)
     *
     * Useful for evolving a cellular automaton playfield.  In this
     * case, min/max Dx/Dy should be computed from the neighbourhood.
     */
    this.map = function(destPf, fun, minDx, minDy, maxDx, maxDy) {
        if (minDx === undefined) minDx = 0;
        if (minDy === undefined) minDy = 0;
        if (maxDx === undefined) maxDx = 0;
        if (maxDy === undefined) maxDy = 0;
        for (var y = this.minY + minDy; y <= this.maxY + maxDy; y++) {
            for (var x = this.minX + minDx; x <= this.maxX + maxDx; x++) {
                destPf.putDirty(x, y, fun(this, x, y));
            }
        }
        destPf.recalculateBounds();
    };

    /*
     * Accessors for the minimum (resp. maximum) x (resp. y) values of
     * occupied (non-default-valued) cells in this Playfield.  If there are
     * no cells in this Playfield, these will refturn undefined.  Note that
     * these are not guaranteed to be tight bounds; if values in cells
     * are deleted, these bounds may still be considered to be outside them.
     */
    this.getMinX = function() {
        return this.minX;
    };
    this.getMaxX = function() {
        return this.maxX;
    };
    this.getMinY = function() {
        return this.minY;
    };
    this.getMaxY = function() {
        return this.maxY;
    };

    /*
     * Returns the number of occupied cells in the x direction.
     */
    this.getExtentX = function() {
        if (this.maxX === undefined || this.minX === undefined) {
            return 0;
        } else {
            return this.maxX - this.minX + 1;
        }
    };

    /*
     * Returns the number of occupied cells in the y direction.
     */
    this.getExtentY = function() {
        if (this.maxY === undefined || this.minY === undefined) {
            return 0;
        } else {
            return this.maxY - this.minY + 1;
        }
    };
};
