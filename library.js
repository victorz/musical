var currentDir = "/";
var currentTrack;
var playQueue = [];

window.onload = function() {

	loadButton = document.getElementById("load-button");
	audio = document.getElementById("audio");
	audio.volume = 0.1;
	dirField = document.getElementById("dirfield");
	previousButton = document.querySelector("#controls #previous");
	playButton = document.querySelector("#controls #play");
	nextButton = document.querySelector("#controls #next");
	playButton.addEventListener("click", function() {
		if (!currentTrack) {
			currentTrack = document.querySelector("#entrylist .file");
			if (currentTrack) {
				setNewTrackAsPlaying(currentTrack);
			}
		} else if (audio.paused && currentTrack) {
			audio.play();
			this.textContent = "Pause";
		} else {
			audio.pause();
			this.textContent = "Play";
		}
	});
	previousButton.addEventListener("click", previousTrack);
	nextButton.addEventListener("click", nextTrack);
	audio.addEventListener("ended", nextTrack);

	loadButton.addEventListener("click", function() {
		var dir = "/" + dirField.value;
		loadLibraryDirectory(dir, parseJSON, {"dir": dir});
	});

	// load library on page load
	loadLibraryDirectory("/", parseJSON, {"dir": "/"});
};

function setNewTrackAsPlaying(newTrack) {
	if (currentTrack) {
		currentTrack.classList.remove("playing");
	}
	if (newTrack && newTrack.classList.contains("file")) {
		newTrack.classList.add("playing");
		audio.src = "library/" + currentDir + "/" + newTrack.textContent;
		console.log("Now playing: " + newTrack.textContent);
		audio.play();
		playButton.textContent = "Pause";
	} else {
		audio.pause();
		audio.src = "";
		playButton.textContent = "Play";
	}
	currentTrack = newTrack;
}

function nextTrack() {
	if (currentTrack) {
		setNewTrackAsPlaying(currentTrack.nextElementSibling);
	}
}

function previousTrack() {
	if (currentTrack) {
		setNewTrackAsPlaying(currentTrack.previousElementSibling);
	}
}

function parseJSON(json, callbackArgs) {
	var parsedJSON = JSON.parse(json);
	if (parsedJSON.status !== "OK") {
		alert("Error: " + parsedJSON.error);
		return;
	}
	currentDir = callbackArgs.dir;
	var entryList = document.getElementById("entrylist");
	while (entryList.childElementCount) {
		entryList.removeChild(entryList.firstChild);
	}
	// add parent directory list entry if not at the root directory
	if (currentDir !== "/") {
		var listItem = document.createElement("li");
		listItem.textContent = "..";
		listItem.classList.add("directory");
		entryList.appendChild(listItem);
		listItem.addEventListener("click", function() {
			// open directory
			var dir = currentDir.slice(0, currentDir.lastIndexOf("/"));
			if (dir === "") {
				dir = "/";
			}
			loadLibraryDirectory(dir, parseJSON, {"dir": dir});
		});
	}
	for (var i = 0; i < parsedJSON.directories.length; i++) {
		var listItem = document.createElement("li");
		listItem.textContent = parsedJSON.directories[i];
		listItem.classList.add("directory");
		entryList.appendChild(listItem);
		listItem.addEventListener("click", function() {
			// open directory
			var dir = currentDir + "/" + this.textContent;
			loadLibraryDirectory(dir, parseJSON, {"dir": dir});
		});
	}
	for (var i = 0; i < parsedJSON.files.length; i++) {
		var listItem = document.createElement("li");
		listItem.textContent = parsedJSON.files[i];
		listItem.classList.add("file");
		entryList.appendChild(listItem);
		listItem.addEventListener("click", function() {
			setNewTrackAsPlaying(this);
		});
	}
}

function loadLibraryDirectory(dir, callback, callbackArgs) {
	if (window.XMLHttpRequest) {
		var httpRequest = new XMLHttpRequest();
		httpRequest.onreadystatechange = function() {
			if (httpRequest.readyState === 4 && httpRequest.status === 200) {
				callback(httpRequest.response, callbackArgs);
			}
		};
		httpRequest.open("GET", "cgi-bin/library.py?dir=" + dir, true);
		httpRequest.send(null);
	} else {
		alert("Your browser does not support XMLHttpRequest. (Try Chrome?)");
	}
}
