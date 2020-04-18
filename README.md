# MultiMusic Server (multimusic-server)

A SnapServer server interface for use multimusic-controller

Create a MultiRoom server for Spotify Conenct
Each group of SnapCast client create dynamically a Spotify Connect speaker.
The server make an API for control groups (add and remove speaker from a group) and volume (by speaker)

An application (multimusic-controller) is also available for control SnapCast Server and its SnapCast clients

### Serve MultiMusic Controller
Place builded MultiMusic Controller PWA in the /static folder
The static folder is automatically serve on /
