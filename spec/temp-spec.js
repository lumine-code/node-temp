const fs = require('fs');
const path = require('path');
const temp = require('../lib/temp');

temp.track();

describe("temp", () => {
  // Specs share the module-level tracking lists, so clear any residue between
  // them to keep the cleanup counts independent of spec ordering.
  beforeEach(() => temp.cleanupSync());

  it("mkdir", (done) => {
    temp.mkdir('foo', (err, tpath) => {
      expect(err).toBeFalsy();
      expect(path.basename(tpath).slice(0, 3)).toBe('foo');
      expect(fs.existsSync(tpath)).toBe(true);

      fs.writeFileSync(path.join(tpath, 'a file'), 'a content');
      temp.cleanupSync();
      expect(fs.existsSync(tpath)).toBe(false);
      done();
    });
  });

  it("open", (done) => {
    temp.open('bar', (err, info) => {
      expect(typeof info).toBe('object');
      expect(typeof info.fd).toBe('number');
      fs.writeSync(info.fd, 'foo');
      fs.closeSync(info.fd);
      expect(typeof info.path).toBe('string');
      expect(fs.existsSync(info.path)).toBe(true);

      temp.cleanupSync();
      expect(fs.existsSync(info.path)).toBe(false);
      done();
    });
  });

  it("stream", (done) => {
    const stream = temp.createWriteStream('baz');
    expect(stream instanceof fs.WriteStream).toBe(true);
    stream.write('foo');
    stream.end("More text here\nand more...", () => {
      expect(fs.existsSync(stream.path)).toBe(true);

      const tempDir = temp.mkdirSync("foobar");
      expect(fs.existsSync(tempDir)).toBe(true);

      temp.cleanupSync();
      expect(fs.existsSync(stream.path)).toBe(false);
      expect(fs.existsSync(tempDir)).toBe(false);
      done();
    });
  });

  it("cleanup", (done) => {
    // Make a temp file just to clean up.
    const tempFile = temp.openSync();
    fs.writeSync(tempFile.fd, 'foo');
    fs.closeSync(tempFile.fd);
    expect(fs.existsSync(tempFile.path)).toBe(true);

    temp.cleanup((err, counts) => {
      expect(err).toBeFalsy();
      expect(fs.existsSync(tempFile.path)).toBe(false);
      expect(counts.files).toBe(1);
      done();
    });
  });

  it("path", () => {
    let tempPath = temp.path();
    expect(path.dirname(tempPath)).toBe(temp.dir);

    tempPath = temp.path({ dir: process.cwd() });
    expect(path.dirname(tempPath)).toBe(process.cwd());
  });

  it("attaches at most one exit listener no matter how many temp files are created", () => {
    // temp's exit listener is attached on the first tracked path (earlier specs),
    // so creating many more must not add any additional listeners. Compare against
    // the current count rather than an absolute, since the test runner adds its own.
    const before = process.listeners('exit').length;
    for (let i = 0; i <= 10; i++) {
      temp.openSync();
    }
    expect(process.listeners('exit').length).toBe(before);
  });
});
