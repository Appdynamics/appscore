/*!
 *  dc.leaflet 0.2.2
 *  http://dc-js.github.io/dc.leaflet.js/
 *  Copyright 2014-2015 Boyan Yurukov and the dc.leaflet Developers
 *  https://github.com/dc-js/dc.leaflet.js/blob/master/AUTHORS
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
(function() { function _dc_leaflet(dc) {
'use strict';

var dc_leaflet = {
    version: '0.2.2'
};

dc_leaflet.leafletBase = function(_chart) {
    _chart = dc.marginMixin(dc.baseChart(_chart));

    _chart.margins({left:0, top:0, right:0, bottom:0});

    var _map;

    var _mapOptions=false;
    var _defaultCenter=false;
    var _defaultZoom=false;

    var _cachedHandlers = {};

    var _createLeaflet = function(root) {
        // append sub-div if not there, to allow client to put stuff (reset link etc.)
        // in main div. might also use relative positioning here, for now assume
        // appending will put in right position
        var child_div = root.selectAll('div.dc-leaflet')
                .data([0]).enter()
              .append('div').attr('class', 'dc-leaflet')
                .style('width', _chart.effectiveWidth() + "px")
                .style('height', _chart.effectiveHeight() + "px");

        return L.map(child_div.node(),_mapOptions);
    };

    var _tiles=function(map) {
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    };

    _chart.createLeaflet = function(_) {
        if(!arguments.length) {
            return _createLeaflet;
        }
        _createLeaflet = _;
        return _chart;
    };

    _chart._doRender = function() {
        _map = _createLeaflet(_chart.root());
        for(var ev in _cachedHandlers)
            _map.on(ev, _cachedHandlers[ev]);

        if (_defaultCenter && _defaultZoom) {
            _map.setView(_chart.toLocArray(_defaultCenter), _defaultZoom);
        }

        _chart.tiles()(_map);

        _chart._postRender();

        return _chart._doRedraw();
    };

    _chart._doRedraw = function() {
        return _chart;
    };

    _chart._postRender = function() {
        return _chart;
    };

    _chart.mapOptions = function(_) {
        if (!arguments.length) {
            return _mapOptions;
        }
        _mapOptions = _;
        return _chart;
    };

    _chart.center = function(_) {
        if (!arguments.length) {
            return _defaultCenter;
        }
        _defaultCenter = _;
        return _chart;
    };

    _chart.zoom = function(_) {
        if (!arguments.length) {
            return _defaultZoom;
        }
        _defaultZoom = _;
        return _chart;
    };

    _chart.tiles = function(_) {
        if (!arguments.length) {
            return _tiles;
        }
        _tiles = _;
        return _chart;
    };

    _chart.map = function() {
        return _map;
    };

    _chart.toLocArray = function(value) {
        if (typeof value === "string") {
            // expects '11.111,1.111'
            value = value.split(",");
        }
        // else expects [11.111,1.111]
        return value;
    };

    // combine Leaflet events into d3 & dc events
    dc.override(_chart, 'on', function(event, callback) {
        var leaflet_events = ['zoomend', 'moveend'];
        if(leaflet_events.indexOf(event) >= 0) {
            if(_map) {
                _map.on(event, callback);
            }
            else {
                _cachedHandlers[event] = callback;
            }
            return this;
        }
        else return _chart._on(event, callback);
    });

    return _chart;
};

//Legend code adapted from http://leafletjs.com/examples/choropleth.html
dc_leaflet.legend = function() {
    var _parent, _legend = {};
    var _leafletLegend = null;
    var _position = 'bottomleft';

    _legend.parent = function (parent) {
        if(!arguments.length)
            return _parent;
        _parent = parent;
        return this;
    };

    function _LegendClass() {
        return L.Control.extend({
            options: {position: _position},
            onAdd: function (map) {
                this._div = L.DomUtil.create('div', 'info legend');
                map.on('moveend',this._update,this);
                this._update();
                return this._div;
            },
            _update: function () {
                if (_parent.colorDomain()) { // check because undefined for marker charts
                    var minValue = _parent.colorDomain()[0],
                        maxValue = _parent.colorDomain()[1],
                        palette = _parent.colors().range(),
                        colorLength = _parent.colors().range().length,
                        delta = (maxValue - minValue)/colorLength,
                        i;

                    // define grades for legend colours
                    // based on equation in dc.js colorCalculator (before version based on colorMixin)
                    var grades = [];
                    grades[0] = Math.round(minValue);
                    for (i= 1; i < colorLength; i++) {
                        grades[i] = Math.round((0.5 + (i - 1)) * delta + minValue);
                    }

                    var div = L.DomUtil.create('div', 'info legend');
                    // loop through our density intervals and generate a label with a colored
                    // square for each interval
                    this._div.innerHTML = ""; //reset so that legend is not plotted multiple times
                    for (i = 0; i < grades.length; i++) {
                        this._div.innerHTML +=
                            '<i style="background:' + palette[i] + '"></i> ' +
                            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
                    }
                }
            }
        });
    }

    _legend.LegendClass = function(LegendClass) {
        if(!arguments.length)
            return _LegendClass;
        _LegendClass = LegendClass;
        return _legend;
    };

    _legend.render = function () {
        // unfortunately the dc.js legend has no concept of redraw, it's always render
        if(!_leafletLegend) {
            // fetch the legend class creator, invoke it
            var Legend = _legend.LegendClass()();
            // and constuct that class
            _leafletLegend = new Legend();
            _leafletLegend.addTo(_parent.map());
        }

        return _legend.redraw();
    };

    _legend.redraw = function () {
        _leafletLegend._update();
        return _legend;
    };

    _legend.leafletLegend = function () {
        return _leafletLegend;
    };

    _legend.position = function (position) {
        if(!arguments.length) return _position;
        _position = position;
        return _legend;
    };

    return _legend;
};

dc_leaflet.markerChart = function(parent, chartGroup) {
    var _chart = dc_leaflet.leafletBase({});

    var _renderPopup = true;
    var _cluster = false; // requires leaflet.markerCluster
    var _clusterOptions=false;
    var _rebuildMarkers = false;
    var _brushOn = true;
    var _filterByArea = false;

    var _filter;
    var _innerFilter=false;
    var _zooming=false;
    var _layerGroup = false;
    var _markerList = [];
    var _currentGroups=false;

    _chart.renderTitle(true);

    var _location = function(d) {
        return _chart.keyAccessor()(d);
    };

    var _marker = function(d,map) {
        var marker = new L.Marker(_chart.toLocArray(_chart.locationAccessor()(d)),{
            title: _chart.renderTitle() ? _chart.title()(d) : '',
            alt: _chart.renderTitle() ? _chart.title()(d) : '',
            icon: _icon(),
            clickable: _chart.renderPopup() || (_chart.brushOn() && !_filterByArea),
            draggable: false
        });
        return marker;
    };

    var _icon = function(d,map) {
        return new L.Icon.Default();
    };

    var _popup = function(d,marker) {
        return _chart.title()(d);
    };

    _chart._postRender = function() {
        if (_chart.brushOn()) {
            if (_filterByArea) {
                _chart.filterHandler(doFilterByArea);
            }

            _chart.map().on('zoomend moveend', zoomFilter, this );
            if (!_filterByArea)
                _chart.map().on('click', zoomFilter, this );
            _chart.map().on('zoomstart', zoomStart, this);
        }

        if (_cluster) {
            _layerGroup = new L.MarkerClusterGroup(_clusterOptions?_clusterOptions:null);
        }
        else {
            _layerGroup = new L.LayerGroup();
        }
        _chart.map().addLayer(_layerGroup);
    };

    _chart._doRedraw = function() {
        var groups = _chart._computeOrderedGroups(_chart.data()).filter(function (d) {
            return _chart.valueAccessor()(d) !== 0;
        });
        if (_currentGroups && _currentGroups.toString() === groups.toString()) {
            return;
        }
        _currentGroups=groups;

        if (_rebuildMarkers) {
            _markerList=[];
        }
        _layerGroup.clearLayers();

        var addList=[];
        groups.forEach(function(v,i) {
            var key = _chart.keyAccessor()(v);
            var marker = null;
            if (!_rebuildMarkers && key in _markerList) {
                marker = _markerList[key];
            }
            else {
                marker = createmarker(v,key);
            }
            if (!_chart.cluster()) {
                _layerGroup.addLayer(marker);
            }
            else {
                addList.push(marker);
            }
        });

        if (_chart.cluster() && addList.length > 0) {
            _layerGroup.addLayers(addList);
        }
    };

    _chart.locationAccessor = function(_) {
        if (!arguments.length) {
            return _location;
        }
        _location= _;
        return _chart;
    };

    _chart.marker = function(_) {
        if (!arguments.length) {
            return _marker;
        }
        _marker= _;
        return _chart;
    };

    _chart.icon = function(_) {
        if (!arguments.length) {
            return _icon;
        }
        _icon= _;
        return _chart;
    };

    _chart.popup = function(_) {
        if (!arguments.length) {
            return _popup;
        }
        _popup= _;
        return _chart;
    };

    _chart.renderPopup = function(_) {
        if (!arguments.length) {
            return _renderPopup;
        }
        _renderPopup = _;
        return _chart;
    };


    _chart.cluster = function(_) {
        if (!arguments.length) {
            return _cluster;
        }
        _cluster = _;
        return _chart;
    };

    _chart.clusterOptions = function(_) {
        if (!arguments.length) {
            return _clusterOptions;
        }
        _clusterOptions = _;
        return _chart;
    };

    _chart.rebuildMarkers = function(_) {
        if (!arguments.length) {
            return _rebuildMarkers;
        }
        _rebuildMarkers = _;
        return _chart;
    };

    _chart.brushOn = function(_) {
        if (!arguments.length) {
            return _brushOn;
        }
        _brushOn = _;
        return _chart;
    };

    _chart.filterByArea = function(_) {
        if (!arguments.length) {
            return _filterByArea;
        }
        _filterByArea = _;
        return _chart;
    };

    _chart.markerGroup = function() {
        return _layerGroup;
    };

    var createmarker = function(v,k) {
        var marker = _marker(v);
        marker.key = k;
        if (_chart.renderPopup()) {
            marker.bindPopup(_chart.popup()(v,marker));
        }
        if (_chart.brushOn() && !_filterByArea) {
            marker.on("click",selectFilter);
        }
        _markerList[k]=marker;
        return marker;
    };

    var zoomStart = function(e) {
        _zooming=true;
    };

    var zoomFilter = function(e) {
        if (e.type === "moveend" && (_zooming || e.hard)) {
            return;
        }
        _zooming=false;

        if (_filterByArea) {
            var filter;
            if (_chart.map().getCenter().equals(_chart.center()) && _chart.map().getZoom() === _chart.zoom()) {
                filter = null;
            }
            else {
                filter = _chart.map().getBounds();
            }
            dc.events.trigger(function () {
                _chart.filter(null);
                if (filter) {
                    _innerFilter=true;
                    _chart.filter(filter);
                    _innerFilter=false;
                }
                dc.redrawAll(_chart.chartGroup());
            });
        } else if (_chart.filter() && (e.type === "click" ||
                                       (_markerList.indexOf(_chart.filter()) !== -1 &&
                                        !_chart.map().getBounds().contains(_markerList[_chart.filter()].getLatLng())))) {
            dc.events.trigger(function () {
                _chart.filter(null);
                if (_renderPopup) {
                    _chart.map().closePopup();
                }
                dc.redrawAll(_chart.chartGroup());
            });
        }
    };

    var doFilterByArea = function(dimension, filters) {
        _chart.dimension().filter(null);
        if (filters && filters.length>0) {
            _chart.dimension().filterFunction(function(d) {
                if (!(d in _markerList)) {
                    return false;
                }
                var locO = _markerList[d].getLatLng();
                return locO && filters[0].contains(locO);
            });
            if (!_innerFilter && _chart.map().getBounds().toString !== filters[0].toString()) {
                _chart.map().fitBounds(filters[0]);
            }
        }
    };

    var selectFilter = function(e) {
        if (!e.target) return;
        var filter = e.target.key;
        dc.events.trigger(function () {
            _chart.filter(filter);
            dc.redrawAll(_chart.chartGroup());
        });
    };

    return _chart.anchor(parent, chartGroup);
};

dc_leaflet.choroplethChart = function(parent, chartGroup) {
    var _chart = dc.colorChart(dc_leaflet.leafletBase({}));

    var _geojsonLayer = false;
    var _dataMap = [];

    var _geojson = false;
    var _renderPopup = true;
    var _brushOn = true;
    var _featureOptions = {
        'fillColor':'black',
        'color':'gray',
        'opacity':0.4,
        'fillOpacity':0.6,
        'weight':1
    };

    var _featureKey = function(feature) {
        return feature.key;
    };

    var _featureStyle = function(feature) {
        var options = _chart.featureOptions();
        if (options instanceof Function) {
            options=options(feature);
        }
        options = JSON.parse(JSON.stringify(options));
        var v = _dataMap[_chart.featureKeyAccessor()(feature)];
        if (v && v.d) {
            options.fillColor=_chart.getColor(v.d,v.i);
            if (_chart.filters().indexOf(v.d.key) !== -1) {
                options.opacity=0.8;
                options.fillOpacity=1;
            }
        }
        return options;
    };

    var _popup = function(d,feature) {
        return _chart.title()(d);
    };

    _chart._postRender = function() {
        _geojsonLayer=L.geoJson(_chart.geojson(),{
            style: _chart.featureStyle(),
            onEachFeature: processFeatures
        });
        _chart.map().addLayer(_geojsonLayer);
    };

    dc.override(_chart, '_doRedraw', function() {
        _geojsonLayer.clearLayers();
        _dataMap=[];
        _chart._computeOrderedGroups(_chart.data()).forEach(function (d, i) {
            _dataMap[_chart.keyAccessor()(d)] = {'d':d,'i':i};
        });
        _geojsonLayer.addData(_chart.geojson());
        return _chart.__doRedraw();
    });

    _chart.geojson = function(_) {
        if (!arguments.length) {
            return _geojson;
        }
        _geojson = _;
        return _chart;
    };

    _chart.featureOptions = function(_) {
        if (!arguments.length) {
            return _featureOptions;
        }
        _featureOptions = _;
        return _chart;
    };

    _chart.featureKeyAccessor = function(_) {
        if (!arguments.length) {
            return _featureKey;
        }
        _featureKey= _;
        return _chart;
    };

    _chart.featureStyle = function(_) {
        if (!arguments.length) {
            return _featureStyle;
        }
        _featureStyle= _;
        return _chart;
    };

    _chart.popup = function(_) {
        if (!arguments.length) {
            return _popup;
        }
        _popup= _;
        return _chart;
    };

    _chart.renderPopup = function(_) {
        if (!arguments.length) {
            return _renderPopup;
        }
        _renderPopup = _;
        return _chart;
    };

    _chart.brushOn = function(_) {
        if (!arguments.length) {
            return _brushOn;
        }
        _brushOn = _;
        return _chart;
    };

    var processFeatures = function (feature, layer) {
        var v = _dataMap[_chart.featureKeyAccessor()(feature)];
        if (v && v.d) {
            layer.key=v.d.key;
            if (_chart.renderPopup())
                layer.bindPopup(_chart.popup()(v.d,feature));
            if (_chart.brushOn())
                layer.on("click",selectFilter);
        }
    };

    var selectFilter = function(e) {
        if (!e.target) {
            return;
        }
        var filter = e.target.key;
        dc.events.trigger(function () {
            _chart.filter(filter);
            dc.redrawAll(_chart.chartGroup());
        });
    };

    return _chart.anchor(parent, chartGroup);
};

dc_leaflet.d3 = d3;
dc_leaflet.crossfilter = crossfilter;
dc_leaflet.dc = dc;

return dc_leaflet;
}
    if (typeof define === 'function' && define.amd) {
        define(["dc"], _dc_leaflet);
    } else if (typeof module == "object" && module.exports) {
        var _dc = require('dc');
        module.exports = _dc_leaflet(_dc);
    } else {
        this.dc_leaflet = _dc_leaflet(dc);
    }
}
)();

//# sourceMappingURL=dc.leaflet.js.map