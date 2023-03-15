// Import necessary objects from the "db.js" module
import { assets, playlists, flags } from "./db.js";

// Check if indexedDB is supported by the browser
if (!window.indexedDB) {
	console.log("Upgrade your browser to use indexedDB.");
}

// Get the value of the "hasRun" flag and return true if it's not set
const getFirstRun = async () => {
	const runFlag = await flags.getItem("hasRun");
	return !runFlag;
};

// Set the value of the "hasRun" flag to true
const setFirstRun = async () => {
	await flags.setItem("hasRun", true);
};

// Set the playlist in the playlists object
const setPlaylist = async () => {
	// Get the playlist data from a JSON file
	const response = await axios.get("./playlist.json");
	const data = response.data;

	// Store the playlist data in the "playlist" key of the playlists object
	await playlists.setItem("playlist", data);
	return data;
};

// Update the playlist to include the "location" property for each item
const updatePlaylist = async (data) => {
	const updatedPlaylist = data.map((playlistItem) => {
		return {
			...playlistItem,
			location: playlistItem.name,
		};
	});

	await playlists.setItem("playlist", updatedPlaylist);
};

// Set the media assets in the assets object
const setMediaAssets = async (data) => {
	data.forEach(async (playlistItem) => {
		// Get the media asset data and store it in the assets object with the playlist item name as the key
		const mediaAsset = await axios.get(playlistItem.location, { responseType: "blob" });
		await assets.setItem(playlistItem.name, mediaAsset.data);
	});
};

// Get the playlist from the playlists object
const getPlaylist = async () => {
	const playlist = await playlists.getItem("playlist");
	return playlist;
};

// Initialize a count variable and play the media in the playlist
let count = 0;
const playMedia = async (playlist) => {
	// Get the index of the current item in the playlist
	let i = count % playlist.length;
	// Get the location of the current item in the playlist
	let playlistItem = playlist[i].location;
	// Get the media asset data from the assets object using the current item's name as the key
	let mediaAsset = await assets.getItem(playlistItem);

	// If the media asset is a video, display the video player and play the video
	if (mediaAsset.type === "video/mp4") {
		const imgViewer = document.querySelector("#imageViewer");
		imgViewer.style.display = "none";
		const vidPlayer = document.querySelector("#videoPlayer");
		vidPlayer.style.display = "block";
		vidPlayer.setAttribute("src", URL.createObjectURL(mediaAsset));
		// When the video ends, play the next item in the playlist
		vidPlayer.addEventListener("ended", () => {
			playMedia(playlist);
		});
	}
	// If the media asset is an image, display the image viewer and show the image for the specified duration
	if (mediaAsset.type === "image/png") {
		const vidPlayer = document.querySelector("#videoPlayer");
		vidPlayer.style.display = "none";
		const imgViewer = document.querySelector("#imageViewer");
		imgViewer.style.display = "block";
		imgViewer.setAttribute("src", URL.createObjectURL(mediaAsset));
		setTimeout(() => {
			playMedia(playlist);
		}, playlist[i].duration * 1000);
	}
	// Increment the count variable to play the next item in the playlist
	count++;
};

// Main Logic
(async () => {
	const firstRun = await getFirstRun();

	if (firstRun) {
		setFirstRun();
		const data = await setPlaylist();
		setMediaAssets(data);
		updatePlaylist(data);
	}
	const playlist = await getPlaylist();
	playMedia(playlist);
})();
