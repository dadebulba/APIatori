### Spaces endpoints

#### GET /data/spaces
#### GET /data/spaces/:sid
#### POST /data/spaces
body {name}
#### PUT /data/spaces/:sid
body {name}
#### DELETE /data/spaces/:sid

### Booking endpoints

#### POST /data/spaces/:sid/bookings
body {uid, from, to, gid (optional)}
#### PUT /data/spaces/:sid/bookings/:bid
body {uid, from, to, gid (optional)}
#### DELETE /data/spaces/:sid/bookings/:bid