var numHorizontal = 40;
var numVertical = 30;
var quadSize = 20;
var margin = 2;
var fps = 30;
var swapSpeed = 3;
var colorVariation = 40;
var targetColorSwitchTime = 200;

function interpolate(f, x, y) {
    return x + f * (y - x);
}

function randomByte() {
    return Math.floor(Math.random()*256);
}

function hsl(h, s, l) {
    return 'hsl('+h+', '+s+'%, '+l+'%)';
}

function MyColor( _r, _g, _b ) {
    this.r = _r || 0;
    this.g = _g || 0;
    this.b = _b || 0;
    this.variation = function (d) {
        function aux(x) {
            return Math.max(0, Math.min(255, Math.floor(x + d * (Math.random()-0.5))));
        }
        return new MyColor( aux(this.r), aux(this.g), aux(this.b) );
    }
    this.toHex = function () {
        function toHex(n) {
            n = n.toString(16)
            if (n.length < 2)
                n = "0" + n;
            return n;
        }
	    return '#' + toHex(this.r) + toHex(this.g) + toHex(this.b);
    }
}
MyColor.hsl = function(h, s, l) {
    var rgb = hslToRgb(h, s, l);
    return new MyColor(rgb[0], rgb[1], rgb[2]);
}

var targetColor = new MyColor( randomByte(), randomByte(), randomByte() );

function Quad(i, j, color, border) {
    this.isHorizontal = function() {
        return this.direction == 'left' || this.direction == 'right';
    }
    this.isAscending = function() {
        return this.direction == 'left' || this.direction == 'top';
    }
    this.setColorAndBorder = function(color, border) {
      this.color = color == undefined ? '#ff0000' : (color.constructor == MyColor ? color.toHex() : color);
      this.border = border == undefined ? 'black' : (color.constructor == MyColor ? color.toHex() : color);
    }
    this.setColorAndBorder(color, border);
    this.rotation = 0;
    this.lastHadDirection = true;
    this.draw = function(cxt) {
        var hasDirection = this.direction != undefined;
        if (hasDirection || this.lastHadDirection) {
            with (cxt) {
                save();
                translate( j * quadSize + quadSize/2, i * quadSize + quadSize/2 );
                clearRect( -quadSize/2-1, -quadSize/2-1, quadSize+2, quadSize+2 );

                var p1, p2, p3, p4;
                var maxSize = quadSize/2 - margin;
                if (this.direction) {
                    var phi = this.rotation * Math.PI/2;
                    var a = new Vec2( margin*Math.cos(phi),
                                     maxSize*Math.sin(phi) );
                    var b = new Vec2( margin*Math.cos(phi+Math.PI),
                                     maxSize*Math.sin(phi+Math.PI) );
                    p1 = new Vec2( -maxSize + a.x, a.y );
                    p2 = new Vec2(  maxSize - a.x, a.y );
                    p3 = new Vec2(  maxSize - b.x, b.y );
                    p4 = new Vec2( -maxSize + b.x, b.y );
                } else {
                    p1 = new Vec2( -maxSize, -maxSize );
                    p2 = new Vec2(  maxSize, -maxSize );
                    p3 = new Vec2(  maxSize,  maxSize );
                    p4 = new Vec2( -maxSize,  maxSize );
                }
                if (this.isHorizontal()) {
                    rotate(-Math.PI/2);
                }

                beginPath();
                moveTo( p1.x, p1.y )
                lineTo( p2.x, p2.y );
                lineTo( p3.x, p3.y );
                lineTo( p4.x, p4.y );
                closePath();
                fillStyle = this.color;
                fill();
                if (this.border != null) {
                  strokeStyle = this.border;
                  lineWidth = 1;
                  stroke();
                }

                restore();
            }
        }
        this.lastHadDirection = hasDirection;
    };

    this.direction = undefined;
    this.nextColor = undefined;
    this.nextBorder = undefined;
    this.move = function() {
        if (this.direction) {
            var oldRotation = this.rotation;
            var f = this.isAscending() ? 1 : -1;
            this.rotation += f * swapSpeed/fps;
            if (oldRotation * this.rotation < 0) {
                this.setColorAndBorder(this.nextColor, this.nextBorder);
                this.nextColor = undefined;
                this.nextBorder = undefined;
            }
            if (Math.abs(this.rotation) > 1) {
                if (this.nextDirection != undefined) {
                    this.setDirection( this.nextDirection, targetColor.variation(colorVariation) );
                    this.nextDirection = undefined;
                } else {
                    this.rotation = Math.round(this.rotation);
                    this.direction = undefined;
                }
            }
        }
    };
    this.nextDirection = undefined;
    this.setDirection = function( direction, color, border ) {
        this.direction = direction;
        this.nextColor = color;
        this.nextBorder = border;
        if (this.isAscending())
            this.rotation = -1;
        else
            this.rotation = 1;
    };
    this.setNextDirection = function(direction, color, border) {
        if (this.direction) {
            if (Math.abs(this.rotation) > 0.9) {
                this.nextDirection = direction;
                this.nextColor = color;
                this.nextBorder = border;
            }
        } else {
            this.setDirection(direction, color, border);
        }
    };
}

var quads = new Array( numVertical );
for (var i=0; i<numVertical; i++) {
    quads[i] = new Array( numHorizontal );
    for (var j=0; j<numHorizontal; j++) {
        quads[i][j] = new Quad(i, j, new MyColor(randomByte(), randomByte(), randomByte()));
    }
}
function iterQuads(f) {
    for (var i=0; i<numVertical; i++) {
        for (var j=0; j<numHorizontal; j++) {
            f( quads[i][j] );
        }
    }
}

var array;
var dialog;

random.dir = function() {
  return ['left', 'right', 'top', 'bottom'][Math.floor(Math.random()*4)];
};

// var Lines = function() {
//   this.lines = {};
//   this.register = function(line) {
//     log(["Registerd ", line.show()]);
//     this.lines[line.id] = line;
//   };
//   this.unregister = function(line) {
//     log(['Unregister ', line.show()]);
//     delete this.lines[line.id];
//   };
//   this.step = function() {
//     for (var ix in this.lines)
//       this.lines[ix].step();
//   };
// };
// var lines = new Lines();

// var Line = function(positions, opts) {
//   var index = 0;
//   this.id = uuid('line-');
//   var settings = { color: new MyColor(255,0,0), border: new MyColor(0,0,0), dir: 'right', k: function(){} };
//   $.extend(settings, opts||{});
//   this.step = function() {
//     if (index < positions.length) {
//       var position = positions[index];
//       if (position) {
//         var quad = quads[position.j][position.i];
//         quad.setNextDirection(
//             position.dir||callOrValue(settings.dir),
//             callOrValue(settings.color),
//             callOrValue(settings.border));
//       }
//       index++;
//     } else {
//       settings.k();
//       lines.unregister(this);
//       rolling = false;
//     }
//   };
//   this.show = function() {
//     return this.id;
//   };
// };

// var stepsToDesign = goSteps({j:0,i:0},times(25,{dir:'right'}).concat(times(15,{dir:'bottom'})).concat(times(3,{dir:'right'})));
// var stepsToProjects = goSteps({j:1,i:4},times(12,{dir:'right'}).concat(times(5,{dir:'bottom'})).concat(times(3,{dir:'right'})));

$(function() {
    dialog = $('#loggingdialog').dialog({
        position: 'right',
        autoOpen: true,
        modal: false,
        width: 200,
        height: 400
    });
    $('h1').click(function() { dialog.dialog('open'); });

    array = $('#main canvas')
    array.attr('width', numHorizontal * quadSize);
    array.attr('height', numVertical * quadSize);
    function remargin() {
        var marginTop = $(window).height()/2 - array.attr('height')/2
          , marginLeft = $(window).width()/2 - array.attr('width')/2;
        $('#main').css('margin-top', marginTop);
        $('#main').css('margin-left', marginLeft);
    }
    remargin();
    $(window).resize( remargin );
    array.mousemove( mousemove );

    // $('#menu ul').hide();

    var cxt = array[0].getContext('2d');

    cxt.clearRect( 0, 0, numHorizontal * quadSize, numVertical * quadSize );
    iterQuads( function(q) { q.draw(cxt, true); } );
    $(document).everyTime( 1000/fps, function() {
        var i = 0;
        iterQuads(function(q) { if (q.direction) i++; });
        message(["currently directing quads:", i]);
        iterQuads( function(q) { q.move(); } );
        iterQuads( function(q) { q.draw(cxt); } );
    });
    $(document).everyTime( 50, function() {
        if (Math.random()*100 < 20) {
            var i = Math.floor(Math.random() * numVertical);
            var j = Math.floor(Math.random() * numHorizontal);
            quad = quads[i][j];
            quad.setNextDirection(random.dir(), random.color());
        }
    });

    function drawLine(speed, vertical, i_1, i_2, j, color, variation, subsequently) {
        var dir = ((i_1 == 0 && i_2 == 0) || i_1 > i_2) ?
            (vertical ? 'top' : 'left') :
            (vertical ? 'bottom' : 'right');
        function loop(i_1) {
            $(document).oneTime(speed, function() {
                var quad = vertical ? (quads[i_1][j]) : (quads[j][i_1]);
                quad.setNextDirection(dir, color.variation(variation));
                if (i_1 == i_2) {
                    subsequently && subsequently();
                } else {
                    i_1 += 2 * ((i_1 < i_2) - 0.5);
                    loop(i_1);
                }
            });
        }
        loop(i_1);
    }

    // function runLine() {
    //     $(document).oneTime( 100, function() {
    //         if (Math.random()*100 < 100) {
    //             var vertical = Math.random() < 0.5;
    //             var i_1 = Math.floor(Math.random() * (vertical ? numVertical : numHorizontal));
    //             var i_2 = Math.floor(Math.random() * (vertical ? numVertical : numHorizontal));
    //             var j = Math.floor(Math.random() * (vertical ? numHorizontal : numVertical));
    //             var color = MyColor.hsl(Math.random(), 1, 0.5);
    //             drawLine(50, vertical, i_1, i_2, j, color, runLine);
    //         } else {
    //             runLine();
    //         }
    //     });
    // };
    // runLine();
    array.click(function(ev) {
        var pos = new Vec2( ev.pageX - array.offset().left,
                            ev.pageY - array.offset().top);
        var i = index( pos.y, false );
        var j = index( pos.x, false );
        var vertical = Math.random()<0.5;
        // var color = random.color();
        // var color = MyColor.hsl(Math.random(), 1, 0.5);
        // var color = new MyColor(255,255,255);
        var color = targetColor;
        var variation = 3*colorVariation;
        var speed = 25;
        var lines = [];
        var maybe = function() { return Math.random() < 0.5; };
        var line = function(direction) {
            var positive = maybe ();
            var size = direction ? numVertical : numHorizontal;
            return {
                direction : direction,
                from : positive ? 0 : size - 1,
                to : positive ? size - 1 : 0,
                cons : direction ? j : i
            };
        };
        var direction1 = maybe();
        var lines = [ line(direction1), line(!direction1) ];
        drawLine( speed, lines[0].direction, lines[0].from, lines[0].to, lines[0].cons, color, variation );
        $(document).oneTime( Math.random() * numHorizontal * speed, function () {
            drawLine( speed, lines[1].direction, lines[1].from, lines[1].to, lines[1].cons, color, variation);
        });
        // drawLine( 50, true, i-1, 0, j, color, variation);
        // drawLine( 50, true, i+1, numVertical-1, j, color, variation);
        // drawLine( 50, false, j-1, 0, i, color, variation);
        // drawLine( 50, false, j+1, numHorizontal-1, i, color, variation);
    });

    /*$('#menu > dt, #menu > dd > ul > li').each(function(){
      var joff = Math.floor(($(this).offset().top-array.offset().top)/20)
        , target = Math.floor(($(this).offset().left-array.offset().left)/20);
      lines[joff] = new Line(1,joff);
    });*/

    // $(document).everyTime(50, function(){lines.step();});

    // $('#heading').hover(function() {
    //   lines.register(new Line(stepsToDesign, { color: new MyColor(255,255,255), border: null }));
    //   lines.register(new Line(times(20,null).concat(stepsToDesign), { color: random.color }));
    //   /*$(document).oneTime(2000, function() {
    //     lines.register(new Line(stepsToDesign, { color: random.color }));
    //   });*/
    // }, function(){});
});

function index(pos, half) {
    var off = half ? quadSize/2 : 0;
    return Math.floor( (pos - off) / quadSize );
}

var last = {};
function mousemove( ev ) {
    var pos = new Vec2( ev.pageX - array.offset().left,
                        ev.pageY - array.offset().top);
    var now = millis();
    if (last.pos && last.mouseMoveTime) {

        if (now - last.mouseMoveTime > targetColorSwitchTime)
            targetColor = new MyColor(randomByte(), randomByte(), randomByte());

        var lastI    = index(last.pos.y, true);
        var currentI = index(pos.y,     true);
        var lastJ    = index(last.pos.x, true);
        var currentJ = index(pos.x,     true);

        var delta = pos.minus( last.pos );

        var direction;
        if (lastJ != currentJ) {
            if (delta.x > 0)
                direction = 'right'; //'bottom';
            else
                direction = 'left'; //'top';
        }
        if (lastI != currentI) {
            if (delta.y > 0)
                direction = 'bottom'; //'right';
            else
                direction = 'top'; //'left';
        }
        var i = index(pos.y, false);
        var j = index(pos.x, false);
        if (i >= 0 && i < numVertical && j >= 0 && j < numHorizontal) {
            var quad = quads[index(pos.y,false)][index(pos.x,false)];
            if (direction != undefined && quad != undefined)
                quad.setNextDirection(direction, targetColor.variation(colorVariation));
        }
    }
    last.pos = pos;
    last.mouseMoveTime = now;
}

function Vec2( _x, _y ) {
    this.x = _x;
    this.y = _y;
    this.clone = function() {
        return new Vec2( this.x, this.y );
    };
    this.plus = function( other ) {
        return new Vec2( this.x + other.x, this.y + other.y );
    };
    this.minus = function( other ) {
        return new Vec2( this.x - other.x, this.y - other.y );
    };
    this.show = function() {
        return "<" + this.x + "," + this.y + ">";
    };
    this.scale_ = function(s) {
        this.x *= s;
        this.y *= s;
    }
}

function randomColor() {
    var r = randomByte();
    var g = randomByte();
    var b = randomByte();
    return new MyColor( r, g, b );
}

function concatWords(words, sep) {
    if (sep == undefined) sep = " ";
    var msg = "";
    for (i in words) {
        msg += words[i];
        if (i < words.length - 2)
            msg += sep;
    }
    return msg;
}

function log(words, sep) {
    $('<p>').html(concatWords(words, sep)).prependTo($('#logger'));
}

function message(words, sep) {
    $('#message').html(concatWords(words, sep));
}

function millis() { return new Date().getTime(); }
