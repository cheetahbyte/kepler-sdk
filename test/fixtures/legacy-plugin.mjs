export default {
  metadata: {
    id: "com.example.legacy",
    name: "Legacy Fixture",
    version: "1.0.0",
    author: "Kepler"
  },
  search() { return []; },
  canHandle() { return true; },
  searchGlobal() { return []; },
  resolve() { return null; },
  lookAheadItems() { return []; }
};
