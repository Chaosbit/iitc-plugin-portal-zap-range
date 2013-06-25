// ==UserScript==
// @id             iitc-plugin-portal-zap-range@chaosbit
// @name           IITC plugin: Portal Zap Range
// @category       Layer
// @version        0.0.1.20130625.103406
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://github.com/Chaosbit/iitc-plugin-portal-zap-range/blob/master/portal-zap-range.user.js
// @downloadURL    https://github.com/Chaosbit/iitc-plugin-portal-zap-range/blob/master/portal-zap-range.user.js
// @description    [chaosbit-2013-06-25-103406] Show an portal zap range indicator on map.
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// @grant          none
// ==/UserScript==


function wrapper() {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

// PLUGIN START ////////////////////////////////////////////////////////

// use own namespace for plugin
window.PORTAL_ZAP_RANGE_MIN_ZOOM = 1;
window.plugin.portalZapRange = function() {};
window.plugin.portalZapRange.levelLayers = {};
window.plugin.portalZapRange.levelLayerGroup = new L.LayerGroup();

// Use portal add and remove event to control render of portal level numbers
window.plugin.portalZapRange.portalAdded = function(data) {
  data.portal.on('add', function() {
    plugin.portalZapRange.renderZapRange(this.options.guid, this.getLatLng());
  });

  data.portal.on('remove', function() {
    plugin.portalZapRange.removeLevel(this.options.guid);
  });
}

window.plugin.portalZapRange.renderZapRange = function(guid,latLng) {
    var d = window.portals[guid].options.details;
    if(PLAYER.team === d.controllingTeam.team)
      return;
    var levelNumber = Math.floor(window.getPortalLevel(d));
    var range = 35 + (levelNumber * 5);
    var level = L.circle(latLng, range, { fill: false, color: "red", weight: 1, clickable: false });

    plugin.portalZapRange.levelLayers[guid] = level;
    level.addTo(plugin.portalZapRange.levelLayerGroup);
}

window.plugin.portalZapRange.removeLevel = function(guid) {
    var previousLayer = plugin.portalZapRange.levelLayers[guid];
    if(previousLayer) {
      plugin.portalZapRange.levelLayerGroup.removeLayer(previousLayer);
      delete plugin.portalZapRange.levelLayers[guid];
    }
}

window.plugin.portalZapRange.zoomListener = function() {
  var ctrl = $('.leaflet-control-layers-selector + span:contains("Portal Zap Range")').parent();
  if(window.map.getZoom() > window.PORTAL_ZAP_RANGE_MIN_ZOOM) {
    window.plugin.playerTracker.drawnTraces.clearLayers();
    ctrl.addClass('disabled').attr('title', 'Zoom in to show those.');
  } else {
    ctrl.removeClass('disabled').attr('title', '');
  }
}

var setup =  function() {
  window.addLayerGroup('Portal Zap Range', window.plugin.portalZapRange.levelLayerGroup, true);
  window.addHook('portalAdded', window.plugin.portalZapRange.portalAdded);
  window.map.on('zoomend', window.plugin.portalZapRange.zoomListener);
  window.plugin.portalZapRange.zoomListener();
}

// PLUGIN END //////////////////////////////////////////////////////////

if(window.iitcLoaded && typeof setup === 'function') {
  setup();
} else {
  if(window.bootPlugins)
    window.bootPlugins.push(setup);
  else
    window.bootPlugins = [setup];
}
} // wrapper end
// inject code into site context
var script = document.createElement('script');
script.appendChild(document.createTextNode('('+ wrapper +')();'));
(document.body || document.head || document.documentElement).appendChild(script);
