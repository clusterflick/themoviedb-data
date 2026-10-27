# themoviedb-data

> **[Clusterflick](https://clusterflick.com)** is a free, open-source site
> listing every film showing in London, from 450+ venues in one search.
>
> This repository is tooling for downloading The Movie Database (TMDB)
> catalogue, so it can be explored and experimented with offline. See the
> [Clusterflick organisation](https://github.com/clusterflick) for how the
> pieces fit together.

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
