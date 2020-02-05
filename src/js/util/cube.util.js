
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
