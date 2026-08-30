window.Logi = window.Logi || {};
Logi.util = Logi.util || {};
Logi.util.geo = (function () {

  const EMBED_WIDTH = 520;
  const EMBED_ASPECT = 0.62;

  const DEFAULT_ZOOM = 17;

  function parseCoordinates(input) {
    let text = String(input || '').trim();
    if (!text) return null;
    try {
      text = decodeURIComponent(text);
    } catch {
    }

    const zoomMatch = /@-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?,(\d{1,2})(?:\.\d+)?z/.exec(text);
    const zoom = zoomMatch ? Number(zoomMatch[1]) : undefined;

    const place = /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/.exec(text);
    if (place) return validate(Number(place[1]), Number(place[2]), zoom);

    const osm = /[#&]map=(\d{1,2})(?:\.\d+)?\/(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)/.exec(text);
    if (osm) {
      return validate(Number(osm[2]), Number(osm[3]), Number(osm[1]));
    }

    const google = /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/.exec(text);
    if (google) {
      return validate(Number(google[1]), Number(google[2]), zoom);
    }

    const mlat = /mlat=(-?\d+(?:\.\d+)?)/.exec(text);
    const mlon = /mlon=(-?\d+(?:\.\d+)?)/.exec(text);
    if (mlat && mlon) return validate(Number(mlat[1]), Number(mlon[1]));

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

  function osmEmbedUrl({ lat, lon, zoom = DEFAULT_ZOOM }) {
    const b = boundingBox(lat, lon, zoom);
    const bbox = [b.minLon, b.minLat, b.maxLon, b.maxLat].map(round).join(',');
    return (
      'https://www.openstreetmap.org/export/embed.html' +
      `?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${round(lat)},${round(lon)}`
    );
  }

  function osmLinkUrl({ lat, lon, zoom = DEFAULT_ZOOM }) {
    return (
      `https://www.openstreetmap.org/?mlat=${round(lat)}&mlon=${round(lon)}` +
      `#map=${zoom}/${round(lat)}/${round(lon)}`
    );
  }

  function directionsUrl({ lat, lon }) {
    return `https://www.google.com/maps/dir/?api=1&destination=${round(lat)},${round(lon)}`;
  }

  function formatCoordinates({ lat, lon }) {
    return `${round(lat)}, ${round(lon)}`;
  }

  return { DEFAULT_ZOOM, parseCoordinates, osmEmbedUrl, osmLinkUrl, directionsUrl, formatCoordinates };
})();
