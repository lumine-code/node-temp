# @lumine-code/temp

Temporary files and directories for Node.js.

Generates a unique file or directory name under the system temporary directory, creates it with a safe mode, and optionally removes it automatically on exit. The API mirrors the `fs` module and has no runtime dependencies — cleanup is handled with the built-in `fs.rm`, so there is no `rimraf`/`mkdirp` chain to maintain.

## Features

- **Files, directories, and streams**: create them with `open`/`openSync`, `mkdir`/`mkdirSync`, and `createWriteStream`.
- **Automatic cleanup**: call `track()` once to have created paths removed on process exit.
- **On-demand cleanup**: run `cleanup()`/`cleanupSync()` at any time and get back the counts removed.
- **Custom affixes**: pass a prefix string, or a `{ prefix, suffix, dir }` object, to shape the generated name.
- **No dependencies**: built entirely on Node.js built-ins (`fs`, `os`, `path`).

## Installation

```sh
npm install @lumine-code/temp
```

## Usage

```js
const temp = require("@lumine-code/temp");

// Opt in to automatic cleanup at exit.
temp.track();

temp.mkdir("myprefix", (err, dirPath) => {
  if (err) throw err;
  // ...use dirPath; it is removed automatically on exit.
});
```

If you want cleanup, you must ask for it with `track()` — tracking is opt-in so it does not interfere with long-running server processes. `track()` is chainable, so it is common to call it when requiring the module:

```js
const temp = require("@lumine-code/temp").track();
```

## API

### temp.track([value])

Enable (or, with `false`, disable) tracking of created paths for removal on exit. Returns the module, so it can be chained off `require`.

### temp.mkdir(affixes, callback) / temp.mkdir(affixes)

Create a temporary directory. With a callback, calls back with `(err, dirPath)`; without one, returns a `Promise` for the path.

### temp.mkdirSync(affixes)

Create a temporary directory synchronously and return its path.

### temp.open(affixes, callback) / temp.open(affixes)

Create and open a temporary file. Calls back with (or resolves to) an object with `path` and `fd` keys.

### temp.openSync(affixes)

Create and open a temporary file synchronously; returns `{ path, fd }`.

### temp.createWriteStream(affixes)

Return an `fs.WriteStream` for a new temporary file. The stream's `path` is registered for removal when tracking is enabled.

### temp.path(affixes, [defaultPrefix])

Return a unique path string in the temporary directory **without** creating anything. Creation, mode, and removal are then your responsibility.

### temp.cleanup(callback) / temp.cleanup()

Remove all tracked files and directories and reset the tracking lists. Calls back with (or resolves to) `{ files, dirs }` counts. Errors with `"not tracking"` when tracking is disabled.

### temp.cleanupSync()

Synchronous `cleanup`; returns the `{ files, dirs }` counts, or `false` when not tracking.

### Affixes

Anywhere `affixes` is accepted you may pass:

- a string — used as the filename prefix;
- an object with any of `prefix`, `suffix`, and `dir`;
- `null`/omitted — use the defaults (`f-` for files, `d-` for directories).

## Contributing

Got ideas to make this package better, found a bug, or want to help add new features? Just drop your thoughts on GitHub. Any feedback is welcome!
