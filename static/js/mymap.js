
$j = jQuery.noConflict();
var map, base_layer, kml;
function onFeatureSelect(e) {
  if (!$j('#details').is(':visible')) {
    showDetails();
    }
  var dataName = e.feature.attributes.description;
  $j('#dataName').html(dataName);
  $j('#loading').fadeIn();
  $j('#details').fadeOut();
  var sr_no = dataName.split(" ")[0];
  var url = "/json/heritage/";
  $j.getJSON("/json/heritage/", {
    'sr': sr_no
    }, function(json) {
    $j('#loading').hide();
    //populates spans with id = <fieldname>_val with json data
    for (j in json) {
      if (j != 'images') {
        $j('#' + j + "_val").html(json[j]);
        }
      }
    var imagesHtml = '';
    var images = json.images
    if (images.length > 0) {
      for (i in images) {
        imagesHtml += "<a href='" + images[i].url + "'><img src='" + images[i].thumb + "'></a>";
        }
      $j('#images_data').html(imagesHtml);
      $j('#images_data a').lightBox({
        imageLoading: 'http://bombayology.com/static/imgs/lightbox-ico-loading.gif',
	      imageBtnClose: 'http://bombayology.com/static/imgs/lightbox-btn-close.gif',
	      imageBtnPrev: 'http://bombayology.com/static/imgs/lightbox-btn-prev.gif',
	      imageBtnNext: 'http://bombayology.com/static/imgs/lightbox-btn-next.gif'
        });
      $j('#images').show();
      } else {
      $j('#images').css("display", "none");
      }
    
    $j("#details").fadeIn();
    if (json.hist_context == '' || json.hist_context == null) {
      $j('#history').hide();
      } else {
      $j('#history').show();
      }
    });
  }

function onMouseOver(e) {
  $j('#test').html(e.posX);
  }

function mapLoaded() {
//  $j('#data').fadeIn();
  }

function showDetails() {
  $j('#map').css("width", "50%");
  $j('#data').show("slow");
  }

function hideDetails() {
  $j('#data').hide("slow");
  $j('#map').css("width", "100%");
  }

function loadLayer(layerName, verboseName, transparent) {
  mapservPath = "http://bombayology.org/cgi-bin/mapserv?map=vvsr.map";
  if (!transparent) { transparent = 'true'; }
  var layer = new OpenLayers.Layer.WMS(verboseName, mapservPath, {layers: layerName, transparent: transparent} ); 
  return layer;
  }

$j(document).ready(function() {
  var center = new OpenLayers.LonLat(72.855211097628413, 19.415775291486027);
  map = new OpenLayers.Map('map', {
    numZoomLevels: 10,
    minResoltuion: 0.1,
    maxResolution: 0.001     
    });
  var layerNames = {
    'municipal_boundaries': 'VVSR Municipal Boundaries',
    'lin_building': "VVSR Buildings",    
    'roads_major': "VVSR Major Roads",
    'roads_local': "VVSR Local Roads",
    'roads_intermediate': "VVSR Intermediate Roads",    
    'village_boundaries': "VVSR Village Boundaries"
//    'heritage': "Heritage Structure Labels"
    };
  var layers = [];
  //base layer
  layers[0] = new OpenLayers.Layer.WMS("VVSR", "http://bombayology.org/cgi-bin/mapserv?map=vvsr.map", {layers: 'vvsr_boundary'}  );
  var i = 1;  
  //load rest of layers in layerNames from mapServ
  for (l in layerNames) {
    layers[i] = loadLayer(l, layerNames[l]);
    i++;  
    }

  //load heritage structures from kml
  kml = new OpenLayers.Layer.GML("Heritage Structures", "/kml/", 
     { format: OpenLayers.Format.KML });
  layers[i] = kml;
  map.addLayers(layers);
  //init map
  map.setCenter(center, 1);
  var control = new OpenLayers.Control.SelectFeature(kml);
  map.addControl(control);
  map.addControl(new OpenLayers.Control.LayerSwitcher());
  map.addControl(new OpenLayers.Control.PanZoomBar());
  map.addControl(new OpenLayers.Control.MouseToolbar());
  control.activate();
  //add event handlers to kml layer
  kml.events.on({
    "loadend": mapLoaded,
    "featureselected": onFeatureSelect
    });
  $j('.toggleBtn').click(function() {
    $j(this).next().toggle();
    });
  $j('#closeButton').click(hideDetails);
  });


