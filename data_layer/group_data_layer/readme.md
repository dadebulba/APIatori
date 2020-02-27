### Group endpoints

#### GET /data/groups
#### GET /data/groups/:gid
#### POST /data/groups
body {name, educators, collaborators, guys, calendarMail (opt)}
#### PUT /data/groups/:gid
body {name, educators, collaborators, guys, calendarMail (opt), balance (opt), transactions (opt)}
#### DELETE /data/groups/:gid