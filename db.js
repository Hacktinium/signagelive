// import localforage from "localforage";

const dbName = "Media Player App";

// Create 'assets' store
const assets = localforage.createInstance({
	name: dbName,
	storeName: "assets",
});

// Create 'playlists' store
const playlists = localforage.createInstance({
	name: dbName,
	storeName: "playlists",
});

// Create 'flags' store
const flags = localforage.createInstance({
	name: dbName,
	storeName: "flags",
});

export { assets, playlists, flags };
