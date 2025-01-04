function interpolate(s, x, y) {
    return x + s * (y - x);
};

function callOrValue(x) {
  if (typeof x == 'function')
    return x();
  else
    return x;
}

function times(n, x) {
  var res = [];
  for (var ix=0;ix<n;ix++)
    res.push(x);
  return res;
}
function fromTo(i, j) {
  var res = [];
  for (var k=i; k<=j; k++)
    res.push(k);
  return res;
}
function cross(xname, xs, yname, ys) {
  var res = [];
  var max = Math.min(xs.length, ys.length);
  for (var ix=0; ix<max; ix++) {
    var obj = {};
    obj[xname] = xs[ix];
    obj[yname] = ys[ix];
    res.push(obj);
  }
  return res;
}
function goSteps(start, steps) {
  var pos = clone(start);
  var res = [];
  res.push({ j: start.j, i: start.j, dir: steps[0].dir});
  for (var ix=0; ix<steps.length; ix++) {
    var step = steps[ix];
    switch (step.dir) {
      case 'left': pos.i--; break;
      case 'right': pos.i++; break;
      case 'top': pos.j--; break;
      case 'bottom': pos.j++; break;
      default: alert("no valide step direction: " + steps[ix]); break;
    }
    var obj = { j: pos.j, i: pos.i, dir: step.dir };
    res.push(obj);
  }
  return res;
}
var counter=0;
function uuid(prefix) {
  return (prefix||'') + counter++;
}
var clone = function(obj) { return $.extend( {}, obj ); }
// Object.prototype.clone = function() $.extend({}, this);
// Object.prototype.modify_ = function(attr, f) {
//     this[attr] = f(this[attr]);
//     return this;
// }
// Object.prototype.set_ = function(attr, x) {
//     this[attr] = x;
//     return this;
// }

function justBefore(x, f) {
    f(x);
    return x;
};

var ease = {
    linear: function(currentTime, startTime, endTime, startValue, endValue) {
        if (currentTime <= startTime)
            return startValue;
        if (currentTime >= endTime)
            return endValue;
        var timeRatio = (currentTime - startTime) / (endTime - startTime);
        return interpolate(timeRatio, startValue, endValue);
    },
    cos: function(currentTime, startTime, endTime, startValue, endValue) {
        if (currentTime <= startTime)
            return startValue;
        if (currentTime >= endTime)
            return endValue;
        var timeRatio = (currentTime - startTime) / (endTime - startTime);
        var progress = 0.5 - Math.cos( timeRatio * Math.PI ) / 2;
        return interpolate(progress, startValue, endValue);
    },
    out: function(currentTime, startTime, endTime, startValue, endValue, fac) {
        if (currentTime <= startTime)
            return startValue;
        if (currentTime >= endTime)
            return endValue;
        if (startTime == endTime)
            return (startValue + endValue)/2;
        if (startValue == endValue)
            return startValue;
        var timeRatio = (currentTime - startTime) / (endTime - startTime);
        var progress = 1 - Math.pow(1 - timeRatio, fac);
        return interpolate(progress, startValue, endValue);
    }
};

function showNumber(x, decimals) {
    if (decimals == undefined)
        return "" + x;
    else {
        var floor = Math.floor(x);
        return "" + floor + "." + Math.floor((x - floor) * Math.pow(10,decimals));
    }
};

function Vec2( x, y ) {
    this.x = x || 0;
    this.y = y || 0;

    this.apply = function(f) {
        return f(this.x, this.y);
    };

    this.clone = function() {
        return new Vec2( this.x, this.y );
    };

    this.plus = function( other ) { return this.clone().plus_( other ); };
    this.plus_ = function( other ) {
        this.x += other.x;
        this.y += other.y;
        return this;
    };

    this.minus = function( other ) { return this.clone().minus_( other ); };
    this.minus_ = function( other ) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    };

    this.scale  = function(s) { return this.clone().scale_(s); };
    this.scale_ = function(s) {
        this.x *= s;
        this.y *= s;
        return this;
    };

    this.setLength = function(l) { return this.clone().setLength_(l); };
    this.setLength_ = function(l) {
        return this.norm_().scale_(l);
    };

    this.inverse = function() { return this.clone().inverse_(); };
    this.inverse_ = function() {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    };

    this.norm = function() { return this.clone().norm_(); };
    this.norm_ = function() {
      return this.scale_(1/this.length());
    };

    this.length = function() {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    };

    this.direction = function() {
        return Math.atan2( this.x, this.y );
    };

    this.interpolate = function(s, other) {
        return new Vec2(interpolate(s, this.x, other.x), interpolate(s, this.y, other.y));
    };

    this.rotate = function(phi) { return this.clone().rotate_(phi); };
    this.rotate_ = function(phi) {
        var tmp = this.x;
        this.x = Math.cos(phi) * this.x - Math.sin(phi) * this.y;
        this.y = Math.sin(phi) * tmp    + Math.cos(phi) * this.y;
        return this;
    };

    this.toLeft = function() { return this.clone().toLeft_(); };
    this.toLeft_ = function() {
        return this.rotate_(Math.PI/2);
    };

    this.show = function(decimals) {
        return "&lang;" + showNumber(this.x, decimals) + "," + showNumber(this.y, decimals) + "&rang;";
    };
}

Vec2.fromDirection = function(phi) {
    return new Vec2( Math.sin(phi), Math.cos(phi) );
}

function konst(x) {
    return function() { return x; };
};

var random = {
    byte: function() {
        return Math.floor( Math.random()*256 );
    },
    boolean: function() { return Math.random() < 0.5; },
    integer: function(i,j) {
        return i + Math.floor(Math.random()*(j-i));
    },
    arrayElement: function(a) {
        return a[random.integer(0, a.length)];
    },
    color: function(r,g,b) {
        r = r || 255; g = g || 255; b = b || 255;
        return new MyColor( random.integer(0,r), random.integer(0,g), random.integer(0,b) );
    },
    uniform: function(a, b) {
        if (b == undefined)
            b = -a;
        return a + Math.random()*(b-a);
    },
    normal: function() {
        if (random.nextNormal == undefined) {
            var u = Math.random();
            var v = Math.random();
            var s = u*u + v*v;
            var x = u * Math.sqrt( -2 * Math.log(s) / s);
            var y = v * Math.sqrt( -2 * Math.log(s) / s);
            random.nextNormal = y;
            return x;
        } else {
            var x = random.nextNormal;
            random.nextNormal = undefined;
            return x;
        }
    },
    booleanInTime: function( elapsed, time ) {
        return Math.random() * time < elapsed;
    },
    color: function() {
        return new MyColor(random.byte(), random.byte(), random.byte());
    }
};

function objectToArray(o) {
    var res = [], index = 0;
    for (var nm in o)
        res[index++] = o[nm];
    return res;
};

function flatten(a) {
    var res = [];
    for (var key_outer in a)
      for (var key_inner in a[key_outer])
        res.push(a[key_outer][key_inner]);
    return res;
};

function flattenOnlyDeeps(a) {
    var res = [];
    for (var key_outer in a)
        if (a[key_outer].__proto__ == Array.prototype)
            for (var key_inner in a[key])
                res.push(a[key][key_inner]);
        else
            res.push(a[key_outer]);
    return res;
};

function MyColor( _r, _g, _b ) {
    if (_r != undefined && _g == undefined && _b == undefined) {
        this.r = _r;
        this.g = _r;
        this.b = _r;
    } else {
        this.r = _r || 0;
        this.g = _g || 0;
        this.b = _b || 0;
    }
    this.plus = function(other) {
        return new MyColor( this.r + other.r, this.g + other.g, this.b + other.b );
    };
    this.toHex = function () {
        function toHex(n) {
            n = n.toString(16)
            if (n.length < 2)
                n = "0" + n;
            return n;
        }
	    return '#' + toHex(this.r) + toHex(this.g) + toHex(this.b);
    };
}


function Bresenham(img, x0, y0, x1, y1){
    var steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);
    if (steep){
        var tmp=x0; x0=y0; y0=tmp;
        var tmp=x1; x1=y1; y1=tmp;
    }
    if (x0 > x1) {
        var tmp=x0; x0=x1; x1=tmp;
        var tmp=y0; y0=y1; y1=tmp;
    }
    var deltax = x1 - x0;
    var deltay = Math.abs(y1 - y0);
    var error = 0;
    var ystep;
    var y = y0;
    if (y0 < y1)
        ystep = 1;
    else
        ystep = -1
    for (x=x0; x<=x1; x++){
        if (steep)
            plot(img, y, x);
        else
            plot(img, x, y);
        error = error + deltay;
        if (2*error >= deltax){
            y = y + ystep;
            error = error - deltax;
        }
    }
}


/**
 FROM http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [r * 255, g * 255, b * 255];
}
