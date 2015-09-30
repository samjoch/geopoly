
(function() {

  // root object
  var root = this;

  /*
   * The Earth's equatorial radius a, or semi-major axis, is the distance from
   * its center to the equator and equals 6,378.1370 kilometers (3,963.1906 mi).
   * The equatorial radius is often used to compare Earth with other planets.
   * cf: https://en.wikipedia.org/wiki/Earth_radius
   */
  root.RADIUS = 6378137; // meters

  var toRadius = function(n) {
    return n * Math.PI / 180;
  }

  var Point = function(coordinates) {
    this.lng = coordinates[0];
    this.lat = coordinates[1];
  }

  /*
   * Compute distance between 2 points in meters.
   * @param {point} [geojson point](http://geojson.org/geojson-spec.html#point)
   * @return {number} Distance in meter
   */
  Point.prototype.distanceWith = function(point) {
    var lat = toRadius(point.lat) - toRadius(this.lat);
    var lng = toRadius(point.lng) - toRadius(this.lng);
    var a = Math.sin(lat / 2) * Math.sin(lat / 2) +
          Math.cos(toRadius(this.lat)) * Math.cos(toRadius(point.lat)) *
          Math.sin(lng / 2) * Math.sin(lng / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return c * root.RADIUS; // returns meters
  }

  /*
   * Retreive geojson point object.
   */
  Point.prototype.toGeoJson = function() {
    return {
      type: 'Point',
      coordinates: [this.lng, this.lat]
    }
  }

  var Geopoly = function(polygon) {
    this.coordinates = polygon.coordinates[0];
    this.length = this.coordinates.length;
  };

  /*
   * Get a specific point of the polygon.
   * @params {i} Index of the point
   * @return {Point}
   */
  Geopoly.prototype.point = function(i) {
    return new Point(this.coordinates[i]);
  };

  /*
   * Compute area in squaremeter.
   * [more](https://github.com/mapbox/geojson-area/blob/master/index.js#L55)
   * @return {number} Area in sqm
   */
  Geopoly.prototype.area = function() {
    var area = 0, i, j, A, B;
    for (i = 0, j = this.length - 1; i < this.length; j = i, i += 1) {
      A = this.coordinates[i];
      B = this.coordinates[j];
      area += toRadius(A[0] - B[0]) *
        (2 + Math.sin(toRadius(A[1])) + Math.sin(toRadius(B[1])));
    }
    return ( Math.abs(area) / 2 ) * root.RADIUS * root.RADIUS;
  };

  /*
   * Compute the centroid of the Polygon
   * @return {Point} Geojson representation of the centroid
   */
  Geopoly.prototype.center = function () {
    if (this._center) {
      return this._center;
    }
    var x = 0, y = 0, i, j, f, A, B, area = 0;
    for (i = 0, j = this.length - 1; i < this.length; j = i, i += 1) {
      A = this.coordinates[i];
      B = this.coordinates[j];
      f = A[1] * B[0] - B[1] * A[0];
      x += (A[0] + B[0]) * f;
      y += (A[1] + B[1]) * f;
      area += A[1] * B[0];
      area -= A[0] * B[1];
    }
    area /= 2;
    f = area * 6;
    this._center = new Point([x / f, y / f]);
    return this._center;
  };

  Geopoly.prototype.radius = function() {
    this._center = this.center();
    var radius = 0, i;
    for (i = 0; i < this.length; i++) {
      var point = this.point(i);
      var old = radius;
      radius = point.distanceWith(this._center);
      radius = old >= radius ? old : radius;
    }
    return radius;
  }

  Geopoly.prototype.circle = function() {
    return {
      center: this.center(),
      radius: this.radius()
    }
  }

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = Geopoly;
    }
    exports = Geopoly;
  } else {
    root.Geopoly = Geopoly;
  }

}.call(this));

