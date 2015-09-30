// GeoJSON Polygon
var feature = require('../sample/campus').features[0].geometry;
var rawSquare = require('../sample/square');
var squareFeature = rawSquare.features[0].geometry;
var squareA = rawSquare.features[1].geometry;
var squareB = rawSquare.features[2].geometry;

var Geopoly = require('../lib');

var campus, square;

describe('Geopoly', function() {
  before(function() {
    campus = new Geopoly(feature);
    square = new Geopoly(squareFeature);
  });
  describe('point', function() {
    it('should return point', function() {
      for(var i = 0; i < campus.length; i++) {
        expect(campus.point(i).toGeoJson()).to.eql({
          type: 'Point',
          coordinates: feature.coordinates[0][i]
        });
      }
    });
  });
  describe('center & radius', function() {
    it('compute center', function() {
      var center = campus.center();
      var radius = campus.radius();
      var ds = []
      for(var i = 0; i < campus.length; i++) {
        ds.push(campus.point(i).distanceWith(center));
      }
      expect(radius).to.be.eql(Math.max.apply(null, ds));
    })
  });
  describe('area', function() {
    it('compute square area', function() {
      var real = square.point(1).distanceWith(square.point(0));
      expect(square.area()).to.be.at.least(real * real);
      // error of 3.3%
      expect(square.area()).to.be.below(real * real * 1.033);
    });
    it('compute polygon', function() {
      // expect from geojson.io
      expect(campus.area()).to.eql(59399.705761473924);
    });
  });
});

