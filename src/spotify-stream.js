const baseUri = 'spotify:///usr/bin/librespot'

function buildStreamId ({ id }) {
  return `${id}_spotify`
}

function buildSpotifyStream ({
  streamId,
  devicename,
  bitrate = 320,
  volume = 100,
}) {
  return baseUri
    + `?name=${streamId}`
    + `&bitrate=${bitrate}`
    + `&devicename=${devicename}`
    + `&volume=${volume}`
    + '&killall=false' // No kill others
    + '&wd_timeout=31536000' // Always active
}

module.exports = {
  buildStreamId,
  buildSpotifyStream,
}
