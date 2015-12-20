window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
  function( callback ){
      window.setTimeout(callback, 1000 / 60);
};
})();


var getViewPort = function() {
	var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;

   return [x, y];
}


var size = getViewPort();
var w = size[ 0 ];
var h = size[ 1 ];
// var Å­ = 0;
var C = document.getElementById('canvas');
var $ = C.getContext('2d');
C.width = w;
C.height = h;
C.style.width = w;
C.style.height = h;

/*http://en.wikipedia.org/wiki/Delaunay_triangulation#Algorithms*/
function Tri(p0, p1, p2) {
  var a1 = 2 * (p1[0] - p0[0]);
  var b1 = 2 * (p1[1] - p0[1]);
  var c1 = p0[0] * p0[0] - p1[0] * p1[0] +
           p0[1] * p0[1] - p1[1] * p1[1];
  var a2 = 2 * (p2[0] - p0[0]);
  var b2 = 2 * (p2[1] - p0[1]);
  var c2 = p0[0] * p0[0] - p2[0] * p2[0] +
           p0[1] * p0[1] - p2[1] * p2[1];
  var c = [(b1 * c2 - b2 * c1) / (a1 * b2 - a2 * b1),
           (c1 * a2 - c2 * a1) / (a1 * b2 - a2 * b1)];
  var d = (c[0]-p0[0])*(c[0]-p0[0]) +
          (c[1]-p0[1])*(c[1]-p0[1]);
  return [p0, p1, p2, c, d];
}

function delaunay(pts) {
  
  var t0 = Tri([0,0], [w,0], [0,h]);
  var t1 = Tri([w,0], [0,h], [w,h]);
  var t = [t0, t1];
  var p = [], l = pts.length, i;
  for (i = 0; i < l; ++i)
    t = _sub(pts[i], t);

  for (p = [], l = t.length, i = 0; i < l; ++i) {
    if (!(((t[i][0][0] === 0 || t[i][0][0] === w) &&
           (t[i][0][1] === 0 || t[i][0][1] === h)) ||
          ((t[i][1][0] === 0 || t[i][1][0] === w) &&
           (t[i][1][1] === 0 || t[i][1][1] === h)) ||
          ((t[i][2][0] === 0 || t[i][2][0] === w) &&
           (t[i][2][1] === 0 || t[i][2][1] === h))))
    p.push(t[i]);
  }
  return p;
}

function _sub(pt, tris) {
  var i,j,k, l,m,n, tri, e, e1, f;
  var loc = [], edg = [], poly = [];


  for (l = tris.length, i = 0; i < l; ++i) {
    tri = tris[i];
 
    if ((tri[3][0]-pt[0])*(tri[3][0]-pt[0]) +
        (tri[3][1]-pt[1])*(tri[3][1]-pt[1])
        < tri[4]) {
  
      edg.push([tri[0], tri[1]],
                 [tri[1], tri[2]],
                 [tri[2], tri[0]]);
    } else {
  
      loc.push(tri);
    }
  }

  for (l = edg.length, i = 0; i < l; ++i) {
    e = edg[i];
    f = false;
    m = poly.length;
    for (j = 0; !f && j < m; ++j) {
      e1 = poly[j];
      f = (e[0][0] == e1[0][0] &&
           e[0][1] == e1[0][1] &&
           e[1][0] == e1[1][0] &&
           e[1][1] == e1[1][1]) ||
          (e[0][0] == e1[1][0] &&
           e[0][1] == e1[1][1] &&
           e[1][0] == e1[0][0] &&
           e[1][1] == e1[0][1]);
    }
    if (f) poly.splice(j - 1, 1);
    else poly.push(e);
  }

  for (l = poly.length, i = 0; i < l; ++i) {
    loc.push(Tri(poly[i][0],
                        poly[i][1],
                        pt));
  }
  return loc.length > 1 ? loc : tris;
}


var pts = [];
var vel = [];
var time = null;

function redraw() {
  var x, y;
  for (var l = pts.length, i = 0; i < l; ++i) {
    x = pts[i][0] + vel[i][0];
    y = pts[i][1] + vel[i][1];
    if (x < 0 || w < x) vel[i][0] = - vel[i][0];
    if (y < 0 || w < y) vel[i][1] = - vel[i][1];
    pts[i][0] += vel[i][0];
    pts[i][1] += vel[i][1];
  }

  var t = delaunay(pts);
  //    Å­ -= 0.5;
  $.setTransform(1,0, 0,1, 0,0);
  
  $.clearRect(0, 0, w, h);
  $.globalCompositeOperation = 'source-over';
  $.strokeStyle = "#FFF";
  $.lineCap = $.lineJoin = 'round';

  $.beginPath();
  for (l = t.length, i = 0; i < l; ++i) {
    $.moveTo(t[i][0][0], t[i][0][1]);
    $.lineTo(t[i][1][0], t[i][1][1]);
    $.lineTo(t[i][2][0], t[i][2][1]);
    $.lineTo(t[i][0][0], t[i][0][1]);
  }
  $.stroke();
}

function start(cnt) {
  if (time) clearInterval(time);
  pts = [];
  vel = [];
  for (var i = 0; i < cnt; i++) {
   	pts.push([Math.random() * w, Math.random() * h]);
    vel.push([Math.random() * 2 - 1, Math.random() * 2 - 1]);
  }
  time = setInterval(redraw, 1000 / 30);
}

window.requestAnimFrame(start(125));