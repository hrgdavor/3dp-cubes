
function cubePointsForAngle(angle, rx){
  var ry = rx / 2
  angle = angle % 90
  if (angle < 0) angle += 90
  
  angle = Math.PI * (angle - 45) / 180
  var points = []
  var sin = Math.sin(angle)
  var cos = Math.cos(angle)
  points.push({x:-cos * rx, y:-sin * ry})
  points.push({x: sin * rx, y:-cos * ry})
  points.push({x: cos * rx, y: sin * ry})
  points.push({x:-sin * rx, y: cos * ry})
  return points
}

function cubeDxForAngle(angle, rx){
  angle = Math.PI * (angle - 45) / 180
  var sin = Math.sin(angle)
  var cos = Math.cos(angle)
  return {x: (cos - sin) * rx, y: (sin + cos) * rx/2} 
  
}

function cubeDyForAngle(angle, rx) {
  angle = Math.PI * (angle - 45) / 180
  var sin = Math.sin(angle)
  var cos = Math.cos(angle)
  return { x: (cos + sin) * rx, y: (sin - cos) * rx / 2 }
  
}

function cubePieceToArray(str) {
  var ret = [];
  var arr = str.split('-')

  function fill(ret, str, val, zFrom = 0) {
    if (!str) return;

    if (/[a-zA-Z]/.test(str[0])) str = str.substring(1)

    var lines = str.split('.')
    for (var x = 0; x < lines.length; x++) {
      if (!ret[x]) ret[x] = [];
      var line = lines[x] || '';
      for (var y = 0; y < line.length; y++) {
        if (!ret[x][y]) ret[x][y] = [];
        var height = parseFloat(line[y] || '0')
        for (var z = 0; z < height; z++) {
          ret[x][y][z + zFrom] = val;
        }
      }
    }
  }
  fill(ret, arr[0], 1)
  for (var i = 1; i < arr.length; i++) {
    fill(ret, arr[i], 0, i - 1)
  }
  return ret;
}

function cubeArrayToPiece(arr, trim){
  var ret = ''
  var holes = []
  var parts = []
  
  arr.forEach((arr_y, yi) =>{
    
    var part = ''
    var maxIndex = 0
   
    var counts = arr_y.map((arr_z, j) =>{
      var height = 0
      var count = 0
      if(arr_z) arr_z.forEach((val,i)=>{
        if(val){
          height ()= i+1
          count++
        } 
      })
      if(height) maxIndex = j
      return {height, count} 
    })
    
    for(var i=0; i<=maxIndex; i++){
      part+= (counts[i] ?  counts[i].height : '0')
    }
   // if(!part) part = '0'
    parts.push(part)
  })

 ret = parts.join('.')

  return ret
}

function cubeListToArray(list){
  var ret = []
  function fill(arr, index){
    for(var i=0; i<=index; i++){
      if(!arr[i]) arr[i] = []
    }
  }
  function add({x, y, z}){
    if(!ret[x]) fill(ret, x) 
    if(!ret[x][y]) fill(ret[x], y) 
    ret[x][y][z] = 1
  }
  list.forEach(add)
  return ret
}

function cubePieceToSize(piece, { wx = 1, wy = 1, wz = 1 } = {}, symetricBottom) {

  var newSize = { wx: Math.max(wx, piece.length), wy, wz };

  piece.forEach(liney => {
    newSize.wy = Math.max(newSize.wy, liney.length);

    liney.forEach(linez => {
      newSize.wz = Math.max(newSize.wz, linez.length);
    })
  });

  if (symetricBottom) {
    newSize.wx = newSize.wy = Math.max(newSize.wx, newSize.wy);
  }
  return newSize;
}

function pointDelta(p1, p2){
  return {x: p2.x-p1.x, y: p2.y-p1.y} 
}

function pointSum(p1, p2){
  return {x: p2.x+p1.x, y: p2.y+p1.y} 
}

function pointScale(p, scale){
  return {x: p.x * scale, y: p.y * scale} 
}

function joinUrl(params){
  return Object.keys(params).map(p=> encodeURIComponent(p)+'='+encodeURIComponent(params[p])).join('&')
}

function parseUrl(str){
  var ret = {}
  if(str[0] == '?') str = str.substring(1)
  str.split('&').forEach(item=>{
    var [key,val] = item.split('=')
    ret[decodeURIComponent(key)] = decodeURIComponent(val)
  })

  return ret
}

function fetchJson(url, options){
  return fetch(url, options).then(resp=>resp.json())
}
function is_in_triangle(px, py, ax, ay, bx, by, cx, cy) {

  //credit: http://www.blackpawn.com/texts/pointinpoly/default.html

  var v0 = [cx - ax, cy - ay];
  var v1 = [bx - ax, by - ay];
  var v2 = [px - ax, py - ay];

  var dot00 = (v0[0] * v0[0]) + (v0[1] * v0[1]);
  var dot01 = (v0[0] * v1[0]) + (v0[1] * v1[1]);
  var dot02 = (v0[0] * v2[0]) + (v0[1] * v2[1]);
  var dot11 = (v1[0] * v1[0]) + (v1[1] * v1[1]);
  var dot12 = (v1[0] * v2[0]) + (v1[1] * v2[1]);

  var invDenom = 1 / (dot00 * dot11 - dot01 * dot01);

  var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
  var v = (dot00 * dot12 - dot01 * dot02) * invDenom;

  return ((u >= 0) && (v >= 0) && (u + v < 1));
}