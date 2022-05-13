var plotThisPoint = {}
var regMarkers = {}
var accMarkers = {}
var points = {}
var groupedPoints = {}
var map = 0
var mainLayer = new L.featureGroup()
const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 17,
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        })

genBaseMap()
function genBaseMap() {
  map = L.map('map', {
    renderer: L.canvas(),
    layers: [satellite],
    fullscreenControl: true
  }
  ).setView([0, 0], 2);
  addLayers()

}

async function startProcessing() {
  
  let fileChosen = document.getElementById('fileUpload').files[0];
  let fileRaw = await fileChosen.text();
  points = await parseFileToPoints(fileRaw)
  
  for (const pointTime in points) {
    plotThisPoint[pointTime] = false
    regMarkers[pointTime] = L.circleMarker(points[pointTime]["latlong"],
      {color: batteryToColour(points[pointTime]["battery"]),
      fill: true,fill_opacity: 1})
      .bindPopup(genPopup(pointTime))
    accMarkers[pointTime] = L.circle(points[pointTime]["latlong"],
      {radius: points[pointTime]["horiAcc"],
      color: batteryToColour(points[pointTime]["battery"]),
      fill: true,fill_opacity: 0.6})
      .bindPopup(genPopup(pointTime))
  }
  
  setMap()
  map.fitBounds(mainLayer.getBounds())
}

function setMap() {
  let minHoriAcc = document.getElementById('minHoriAcc').value
  let maxTimeGap = document.getElementById('maxTimeGap').value
  document.getElementById('minHoriAccOutput').value = minHoriAcc
  document.getElementById('maxTimeGapOutput').value = maxTimeGap
  map.removeLayer(mainLayer)
  mainLayer = new L.featureGroup()
  groupTimeAdjacentEntries(points, parseInt(maxTimeGap))
  finalFilter(minHoriAcc)
  mainLayer.addTo(map)
}


function finalFilter(maxDist) {
  let prevPoint = 0
  let lineLayer = L.featureGroup()
  let markerLayer = L.featureGroup()
  let markers = document.getElementById('showAcc').checked ? accMarkers : regMarkers
  for (const point in points) {
    if ((point in groupedPoints) && groupedPoints[point][0] <= maxDist) {
      if (prevPoint == 0) {
        L.marker(points[point]["latlong"]).bindPopup(genPopup(point)).addTo(markerLayer)
      } else {
        markers[point].addTo(markerLayer)
        let path = [points[prevPoint]["latlong"], points[point]["latlong"]]
        L.polyline(path, {color: batteryToColour(points[prevPoint]["battery"])}).addTo(lineLayer)
      }
      plotThisPoint[point] = true
    prevPoint = point
    } else {plotThisPoint[point] = false}
  }
  //markerLayer.removeLayer(markers[prevPoint])
  L.marker(points[prevPoint]["latlong"]).bindPopup(genPopup(prevPoint)).addTo(markerLayer)
  lineLayer.addTo(mainLayer)
  markerLayer.addTo(mainLayer)
  markerLayer.bringToFront()

  

}

async function parseFileToPoints(data) {
  let lines = data.split("\n").slice(0,-1)
  let entries = {}
  let newEntry = {}
  let batLevel = 100
  for (const line of lines) {
    let parsedLine = JSON.parse(line)
    if ("BatteryCharge" in parsedLine){
        batLevel = parsedLine["BatteryCharge"]["charge"]
    }
    newEntry = {...newEntry, ...parsedLine}
    if ("GPSPosition" in parsedLine) {
      entries[newEntry["Timestamp"]["timestamp"]] = {
        "latlong": [newEntry["GPSPosition"]["latitude"], newEntry["GPSPosition"]["longitude"]],
        "horiAcc": newEntry["GPSPosition"]["accuracyHorizontal"],
        "vertAcc": newEntry["GPSPosition"]["accuracyVertical"],
        "time": newEntry["Timestamp"]["timestamp"],
        "battery": batLevel
      }
      newEntry = {}
    }
  }
  return entries
}

function groupTimeAdjacentEntries(entries, maxGap) {
  let time = 0
  let groupedEntries = {}
  let bunch = []
  for (const entryTime in entries) {
    if ((parseInt(time) + maxGap < parseInt(entryTime)) && bunch.length > 0) {
      let bestPoint = bunch.reduce((prev, cur) =>
        prev["horiAcc"] < cur["horiAcc"] ? prev : cur, bunch[0])
      groupedEntries[bestPoint["time"]] = [bestPoint["horiAcc"], bestPoint["vertAcc"]]
      bunch = []
    } else {
      bunch.push(entries[entryTime])
    }
    time = entryTime
  }
  groupedPoints = groupedEntries
}

function hslToRGB(H, S, L) {
  function f(n) {
    let k = (n + (H / 30.0)) % 12
    let a = S * Math.min(L, 1-L)
    return L - a * Math.max(-1, Math.min(k-3, 9-k, 1))
  }
  return [f(0.0),f(8.0),f(4.0)].map(x => +(x*255).toFixed(0))
}

function batteryToColour(percent) {
  let cols = hslToRGB(percent*1.2, 1, 0.54)
  function nToH(c) {
    let hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }
  return "#"+nToH(cols[0])+nToH(cols[1])+"00"
}

function genPopup(point) {
  let date = new Date(1000 * points[point]["time"]).toGMTString()
  return  "Date: " + date + "<br>"
  + "Battery: " +points[point]["battery"] +"%" + "<br>"
  + "LatLong: " + points[point]["latlong"].map(x => x.toFixed(5)).toString()
}

function addLayers() {
  baseLayers = {
        "Satellite": satellite,
        "Ocean": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
  maxZoom: 13
        }),
        "Topography":L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  maxZoom: 17,
  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors,<a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
})
      }
  overLayers = {
        "Nautical features":L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
  attribution: 'Map data: &copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors'
        }),

        "Road/cities/etc":L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}{r}.{ext}', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 20,
  ext: 'png'
    })
      }
  L.control.layers(baseLayers,overLayers, {collapsed: false}).addTo(map);
}