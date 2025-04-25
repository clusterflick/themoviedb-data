# themoviedb-data

Tooling to pull down The Movie DB data for experimentation

## `npm run get-data`

Gets all of the latest movie data from The Movie DB and caches the responses in
the `data/` directory.

⚠️ This takes a significant period of time to run

## `npm run update-data`

Requests updates to the data since the last `npm run get-data` was run.

⚠️ The Movie DB API only provides access to the last 14 days of changes. After
that, you'll need to run `npm run get-data` again.

## `npm run prune-data`

Removes any deleted entries. Files are not removed as part of
`npm run update-data`
