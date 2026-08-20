window.Logi = window.Logi || {};
Logi.util = Logi.util || {};
Logi.util.geo = (function () {
  /**
   * Map coordinates and OpenStreetMap URL building.
   *
   * The contacts map is driven by a latitude/longitude pair rather than a
   * hand-pasted embed URL, so the pin can be placed on the actual building
   * instead of somewhere near it.
   */

  /** Rough pixel width the embed is displayed at, used to size the bounding box. */
  const EMBED_WIDTH = 520;
  /** Bounding box aspect: the embed is wider than it is tall. */
  const EMBED_ASPECT = 0.62;

  const DEFAULT_ZOOM = 17;

  /**
   * Pulls a coordinate pair out of whatever the user pasted.
   *
   * Handles the three things people actually have to hand:
   *   - plain text            "41.549700, 44.993220"  (or with a space, or N/E suffixes)
   *   - an OpenStreetMap URL  ".../#map=17/41.5497/44.9932"
   *   - a Google Maps URL     ".../@41.5497,44.9932,17z/..."
   *
   * @param {string} input
   * @returns {{lat: number, lon: number, zoom?: number} | null}
   */
  function parseCoordinates(input) {
    let text = String(input || '').trim();
    if (!text) return null;
    // Pasted URLs are sometimes percent-encoded; the Google place marker below
    // is only findable once the "!" separators are readable.
    try {
      text = decodeURIComponent(text);
    } catch {
      /* not valid encoding — carry on with the raw text */
    }

    // The zoom, wherever the coordinates themselves end up coming from.
    const zoomMatch = /@-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?,(\d{1,2})(?:\.\d+)?z/.exec(text);
    const zoom = zoomMatch ? Number(zoomMatch[1]) : undefined;

    // Google Maps place marker: !3d<lat>!4d<lon>.
    // Checked first because it is the pin on the business itself, whereas the
    // "@" part further up the same URL is only wherever the map happened to be
    // centred when the link was copied — typically tens of metres out.
    const place = /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/.exec(text);
    if (place) return validate(Number(place[1]), Number(place[2]), zoom);

    // OpenStreetMap: #map=<zoom>/<lat>/<lon>
    const osm = /[#&]map=(\d{1,2})(?:\.\d+)?\/(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)/.exec(text);
    if (osm) {
      return validate(Number(osm[2]), Number(osm[3]), Number(osm[1]));
    }

    // Google Maps viewport centre: @<lat>,<lon>,<zoom>z
    const google = /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/.exec(text);
    if (google) {
      return validate(Number(google[1]), Number(google[2]), zoom);
    }

    // A query parameter some services use: ?mlat=…&mlon=… or ?q=lat,lon
    const mlat = /mlat=(-?\d+(?:\.\d+)?)/.exec(text);
    const mlon = /mlon=(-?\d+(?:\.\d+)?)/.exec(text);
    if (mlat && mlon) return validate(Number(mlat[1]), Number(mlon[1]));

    // Bare pair: "41.5497, 44.9932" — tolerate N/S/E/W letters around it.
    const bare = /(-?\d{1,3}(?:\.\d+)?)\s*[°]?\s*[NnSs]?\s*[,;\s]\s*(-?\d{1,3}(?:\.\d+)?)\s*[°]?\s*[EeWw]?/.exec(text);
    if (bare) return validate(Number(bare[1]), Number(bare[2]));

    return null;
  }

  function validate(lat, lon, zoom) {
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
    const result = { lat, lon };
    if (Number.isFinite(zoom)) result.zoom = Math.min(19, Math.max(1, Math.round(zoom)));
    return result;
  }

  /**
   * The bounding box OpenStreetMap's embed needs, centred on the pin.
   * Longitude degrees shrink towards the poles, hence the cosine.
   */
  function boundingBox(lat, lon, zoom) {
    const lonSpan = (360 * EMBED_WIDTH) / (256 * 2 ** zoom);
    const latSpan = lonSpan * EMBED_ASPECT * Math.cos((lat * Math.PI) / 180);
    return {
      minLon: lon - lonSpan / 2,
      minLat: lat - latSpan / 2,
      maxLon: lon + lonSpan / 2,
      maxLat: lat + latSpan / 2,
    };
  }

  const round = (n) => Number(n.toFixed(6));

  /**
   * An OpenStreetMap embed URL with a marker on the exact spot.
   * @param {{lat: number, lon: number, zoom?: number}} pin
   */
  function osmEmbedUrl({ lat, lon, zoom = DEFAULT_ZOOM }) {
    const b = boundingBox(lat, lon, zoom);
    const bbox = [b.minLon, b.minLat, b.maxLon, b.maxLat].map(round).join(',');
    return (
      'https://www.openstreetmap.org/export/embed.html' +
      `?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${round(lat)},${round(lon)}`
    );
  }

  /** The full-size map, for the "open in a map" link under the embed. */
  function osmLinkUrl({ lat, lon, zoom = DEFAULT_ZOOM }) {
    return (
      `https://www.openstreetmap.org/?mlat=${round(lat)}&mlon=${round(lon)}` +
      `#map=${zoom}/${round(lat)}/${round(lon)}`
    );
  }

  /** A directions link that opens in whatever map app the visitor has. */
  function directionsUrl({ lat, lon }) {
    return `https://www.google.com/maps/dir/?api=1&destination=${round(lat)},${round(lon)}`;
  }

  function formatCoordinates({ lat, lon }) {
    return `${round(lat)}, ${round(lon)}`;
  }

  return { DEFAULT_ZOOM, parseCoordinates, osmEmbedUrl, osmLinkUrl, directionsUrl, formatCoordinates };
})();
