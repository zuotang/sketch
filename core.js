//------------------------------------------------------------------------------
// <copyright company="Microsoft">
//     Copyright (c) 2006-2009 Microsoft Corporation.  All rights reserved.
// </copyright>
//------------------------------------------------------------------------------

let earthRadius = 6378137;
let minLatitude = -85.05112878;
let maxLatitude = 85.05112878;
let minLongitude = -180;
let maxLongitude = 180;
function clip(n, minValue, maxValue) {
  return Math.min(Math.max(n, minValue), maxValue);
}

function mapSize(levelOfDetail) {
  return 256 << levelOfDetail;
}
function groundResolution(latitude, levelOfDetail) {
  let latitude = clip(latitude, minLatitude, maxLatitude);
  return (Math.cos((latitude * Math.PI) / 180) * 2 * Math.PI * EarthRadius) / mapSize(levelOfDetail);
}
function mapScale(latitude, levelOfDetail, screenDpi) {
  return (groundResolution(latitude, levelOfDetail) * screenDpi) / 0.0254;
}
function latLongToPixelXY(latitude, longitude, levelOfDetail) {
  latitude = clip(latitude, minLatitude, maxLatitude);
  longitude = clip(longitude, minLongitude, maxLongitude);
  let x = (longitude + 180) / 360;
  let sinLatitude = Math.sin((latitude * Math.PI) / 180);
  let y = 0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI);
  let mapsize = mapSize(levelOfDetail);
  let pixelX = clip(x * mapsize + 0.5, 0, mapsize - 1);
  let pixelY = clip(y * mapsize + 0.5, 0, mapsize - 1);
  return [pixelX, pixelY];
}

function pixelXYToLatLong(pixelX, pixelY, levelOfDetail) {
  var mapsize = mapSize(levelOfDetail);
  var x = clip(pixelX, 0, mapsize - 1) / mapsize - 0.5;
  var y = 0.5 - clip(pixelY, 0, mapsize - 1) / mapsize;

  latitude = 90 - (360 * Math.atan(Math.exp(-y * 2 * Math.PI))) / Math.PI;
  longitude = 360 * x;
  return [latitude, longitude];
}

function pixelXYToTileXY(pixelX, pixelY) {
  let tileX = pixelX / 256;
  let tileY = pixelY / 256;
  return [tileX, tileY];
}

function tileXYToPixelXY(tileX, tileY) {
  let pixelX = tileX * 256;
  let pixelY = tileY * 256;
  return [pixelX, pixelY];
}

function tileXYToQuadKey(tileX, tileY, levelOfDetail) {
  let quadKey = "";
  for (let i = levelOfDetail; i > 0; i--) {
    let digit = "0";
    let mask = 1 << (i - 1);
    if ((tileX & mask) != 0) {
      digit++;
    }
    if ((tileY & mask) != 0) {
      digit++;
      digit++;
    }
    quadKey += digit;
  }
  return quadKey;
}

function quadKeyToTileXY(quadKey) {
  let tileX = (tileY = 0);
  let levelOfDetail = quadKey.Length;
  for (let i = levelOfDetail; i > 0; i--) {
    let mask = 1 << (i - 1);
    switch (quadKey[levelOfDetail - i]) {
      case "0":
        break;

      case "1":
        tileX |= mask;
        break;

      case "2":
        tileY |= mask;
        break;

      case "3":
        tileX |= mask;
        tileY |= mask;
        break;

      default:
        throw new ArgumentException("Invalid QuadKey digit sequence.");
    }
  }
  return { tileX, tileY, levelOfDetail };
}
