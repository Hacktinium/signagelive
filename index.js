import { assets, playlists, flags } from "./db.js";

// Check if the browser supports indexedDB
if (!window.indexedDB) {
	// If not, display a message to the user
	const messageElement = document.createElement("div");
	messageElement.style = "display: block; font-size: 18px; text-align: center; background-color: blue;";
	messageElement.innerText = 'Your browser does not support "indexedDB". Please upgrade your browser to the latest version, or use a different browser to ensure full functionality!';
	document.body.appendChild(messageElement);
}

// Check if the app is running for the first time
const getFirstRun = async () => {
	const runFlag = await flags.getItem("hasRun");
	return !runFlag;
};

// Set the first run flag
const setFirstRun = async () => {
	await flags.setItem("hasRun", true);
};

// Set the playlist data
const setPlaylist = async () => {
	// Get the playlist data from the JSON file, and store it in the DB
	const response = await axios.get("./playlist.json");
	const data = response.data;
	await playlists.setItem("playlist", data);
	return data;
};

// Update the playlist data
const updatePlaylist = async (data) => {
	// Loop through the playlist data, updating the location of each media asset to its DB key
	const updatedPlaylist = data.map((playlistItem) => {
		return {
			...playlistItem,
			location: playlistItem.name,
		};
	});

	await playlists.setItem("playlist", updatedPlaylist);
};

// Set the media assets
const setMediaAssets = async (data) => {
	// Loop through the playlist data, fetching the each associated media asset and storing it in the DB
	data.forEach(async (playlistItem) => {
		const mediaAsset = await axios.get(playlistItem.location, { responseType: "blob" });
		await assets.setItem(playlistItem.name, mediaAsset.data);
	});
};

// Get the playlist data from the DB
const getPlaylist = async () => {
	const playlist = await playlists.getItem("playlist");
	return playlist;
};

// Front load the media assets
const frontLoadMediaAssets = (playlist) => {
	// Loop through the playlist and get the media asset from the database, then create an object URL for it
	playlist.forEach(async (playlistItem) => {
		const mediaAsset = await assets.getItem(playlistItem.location);
		const mediaAssetURL = URL.createObjectURL(mediaAsset);

		// If the element is a video, create a video element for the media asset and append it to the body
		if (mediaAsset.type === "video/mp4") {
			const videoElement = document.createElement("video");
			videoElement.id = playlistItem.name;
			videoElement.src = mediaAssetURL;
			videoElement.muted = true;
			videoElement.setAttribute("style", "display: none;");
			document.body.appendChild(videoElement);
		}

		// If the element is an image, create an image element for the media asset and append it to the body
		if (mediaAsset.type === "image/png") {
			const imageElement = document.createElement("img");
			imageElement.id = playlistItem.name;
			imageElement.src = mediaAssetURL;
			imageElement.setAttribute("style", "display: none;");
			document.body.appendChild(imageElement);
		}
	});
};

// Variables for the playMedia function
let count = 0;
let previousMediaAsset;
let currentMediaAsset;

// Play the media assets
const playMedia = (playlist) => {
	// Create repeating index value, to loop through the playlist indefinitely
	let i = count % playlist.length;
	currentMediaAsset = playlist[i];

	// If there is a previous media asset, hide it
	if (previousMediaAsset) {
		const previousElement = document.querySelector(`#${previousMediaAsset.name}`);
		previousElement.style = "display: none;";
	}

	// show the current media asset
	const currentElement = document.querySelector(`#${currentMediaAsset.name}`);
	currentElement.style = "display: block;";

	// Update the variables for the next iteration
	previousMediaAsset = currentMediaAsset;
	count++;

	// If the current media asset is a video, play it and then play the next media asset when it ends,
	// otherwise, play the next media asset after the duration of the current media asset
	if (currentMediaAsset.duration === "0") {
		currentElement.play();
		currentElement.addEventListener(
			"ended",
			() => {
				playMedia(playlist);
			},
			{ once: true }
		);
	} else {
		setTimeout(() => {
			playMedia(playlist);
		}, currentMediaAsset.duration * 1000);
	}
};

// Main Logic
(async () => {
	// Check if the app is running for the first time, if so, set the first run flag, set the playlist data, set the media assets, and update the playlist data
	const firstRun = await getFirstRun();

	if (firstRun) {
		setFirstRun();
		const data = await setPlaylist();
		setMediaAssets(data);
		updatePlaylist(data);
	}

	// Get the playlist data, front-load the media assets, and play the them
	const playlist = await getPlaylist();
	frontLoadMediaAssets(playlist);
	setTimeout(() => {
		playMedia(playlist);
	}, 20);
})();
