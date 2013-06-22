var currentSong = null;

function loadLibraryDirectory(dir, callback, callbackArgs) {
	if (window.XMLHttpRequest) {
		var httpRequest = new XMLHttpRequest();
		httpRequest.onreadystatechange = function() {
			if (httpRequest.readyState === 4 && httpRequest.status === 200) {
				callback(httpRequest.response, callbackArgs);
			}
		};
		httpRequest.open("GET", "cgi-bin/library.py?dir=" + encodeURIComponent(dir), true);
		httpRequest.send(null);
	} else {
		alert("Your browser does not support XMLHttpRequest, which is required to use this web application.");
	}
}

function listElementsFromArray(array) {
	var elements = null;
	if (array && array.length) {
		elements = new Array(array.length);
		for (var i = 0; i < array.length; i++) {
			var li = document.createElement("li");
			li.textContent = array[i];
			elements[i] = li;
		}
	}
	return elements;
}

function fillList(list, elements) {
	for (var i = 0; i < elements.length; i++) {
		list.appendChild(elements[i]);
	}
}

function addEventListeners(list, callback, eventType) {
	for (var i = 0; i < list.length; i++) {
		list[i].addEventListener(eventType, callback);
	}
}

function closeDir(dir) {
	dir.removeChild(dir.querySelector("ul.librarylist"));
}

function openDir(dir) {
	var newList = document.createElement("ul");
	var path = dir.parentNode.getAttribute("data-path") + "/" + dir.textContent;
	newList.setAttribute("data-path", path);
	newList.classList.add("librarylist");
	dir.appendChild(newList);

	var callbackArgs = { list: newList };
	loadLibraryDirectory(path, handleJSONData, callbackArgs);
}

function directoryClicked(e) {
	if (e.target.classList.contains("open")) {
		closeDir(e.target);
		e.target.classList.remove("open");
	} else {
		openDir(e.target);
		e.target.classList.add("open");
	}
	e.stopPropagation();
}

function fileClicked(e) {
	playFile(e.target);
	e.stopPropagation();
}

function handleJSONData(data, args) {
	var json = JSON.parse(data);
	if (json.status !== "OK") {
		alert("unable to load library listing");
		return;
	}

	var directories = listElementsFromArray(json.directories);
	var files = listElementsFromArray(json.files);
	if (directories && directories.length) {
		addEventListeners(directories, directoryClicked, "click");
		fillList(args.list, directories);
		for (var i = 0; i < directories.length; i++) {
			directories[i].classList.add("directory");
		}
	}
	if (files && files.length) {
		addEventListeners(files, fileClicked, "click");
		fillList(args.list, files);
		for (var i = 0; i < files.length; i++) {
			files[i].classList.add("file");
		}
	}
}

function pauseAudio() {
	audio.pause();
	controls.playButton.textContent = "Play";
}

function playAudio() {
	if (audio.src) {
		audio.play();
		controls.playButton.textContent = "Pause";
	}
}

function playFile(li) {
	if (currentSong) {
		currentSong.classList.remove("playing");
	}
	li.classList.add("playing");
	audio.src = "library" + li.parentNode.getAttribute("data-path") + "/" + li.textContent;
	audio.play();
	currentSong = li;
}

function togglePause(e) {
	if (audio.paused) {
		playAudio();
	} else {
		pauseAudio();
	}
}

function playPrevSong(e) {
	if (currentSong) {
		var prevSong = currentSong.previousSibling;
	}
	if (currentSong && prevSong && prevSong.classList.contains("file")) {
		playFile(prevSong);
	}
}

function playNextSong(e) {
	if (currentSong) {
		var nextSong = currentSong.nextSibling;
	}
	if (currentSong && nextSong && nextSong.classList.contains("file")) {
		playFile(nextSong);
	}
}

function changeVolume(e) {
	audio.volume = e.target.value;
}

// Pads the whole part of a number with zeros so as to make it at least `width'
// characters wide.
function padNumber(number, width) {
	var absNumber = Math.abs(number);
	var n = width;
	if (absNumber >= 1) {
		n -= Math.floor(Math.log(absNumber)/Math.LN10);
	}

	var padding = "";
	while (--n > 0) {
		padding += "0";
	}
	return padding + number;
}

function setupPlaybackControls(controls) {
	controls.audio.addEventListener("ended", playNextSong);
	controls.playButton.addEventListener("click", togglePause);
	controls.prevButton.addEventListener("click", playPrevSong);
	controls.nextButton.addEventListener("click", playNextSong);
	controls.volumeControl.addEventListener("change", changeVolume);
	controls.audio.addEventListener("timeupdate", function() {
		controls.positionSlider.value = controls.audio.currentTime / controls.audio.duration;
		var currentTime = Math.floor(controls.audio.currentTime);
		var seconds = currentTime % 60;
		var minutes = Math.floor(currentTime / 60);
		var hours = Math.floor(currentTime / 3600);
		if (hours) {
			controls.currentTime.textContent = hours + ":";
			controls.currentTime.textContent += padNumber(minutes, 2);
		} else {
			controls.currentTime.textContent = padNumber(minutes, 2);
		}
		controls.currentTime.textContent += ":" + padNumber(seconds, 2);
	});
	controls.positionSlider.addEventListener("mouseup", function() {
		controls.audio.currentTime = controls.positionSlider.value * controls.audio.duration;
		togglePause();
	});
	controls.positionSlider.addEventListener("mousedown", function() {
		togglePause();
	});
}

window.addEventListener("load", function() {
	controls = {
		audio: document.getElementById("audio"),
		playButton: document.getElementById("play"),
		prevButton: document.getElementById("prev"),
		nextButton: document.getElementById("next"),
		volumeControl: document.getElementById("volume-slider"),
		positionSlider: document.getElementById("position-slider"),
		currentTime: document.getElementById("position-current"),
		totalTime: document.getElementById("position-duration")
	}
	setupPlaybackControls(controls);

	var libraryList = document.getElementById("librarylist");
	var callbackArgs = { list: libraryList };
	loadLibraryDirectory("/", handleJSONData, callbackArgs);
});
