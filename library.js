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
		e.target.classList.remove("open");
		closeDir(e.target);
	} else {
		e.target.classList.add("open");
		openDir(e.target);
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
	var prevSong = currentSong.previousSibling;
	if (currentSong && prevSong && prevSong.classList.contains("file")) {
		playFile(prevSong);
	}
}

function playNextSong(e) {
	var nextSong = currentSong.nextSibling;
	if (currentSong && nextSong && nextSong.classList.contains("file")) {
		playFile(nextSong);
	}
}

function changeVolume(e) {
	audio.volume = e.target.value;
}

function setupPlaybackControls(controls) {
	controls.playButton.addEventListener("click", togglePause);
	controls.prevButton.addEventListener("click", playPrevSong);
	controls.nextButton.addEventListener("click", playNextSong);
	controls.volumeControl.addEventListener("change", changeVolume);
}

window.addEventListener("load", function() {
	audio = document.getElementById("audio");
	audio.addEventListener("ended", playNextSong);
	controls = {
		playButton: document.getElementById("play"),
		prevButton: document.getElementById("prev"),
		nextButton: document.getElementById("next"),
		volumeControl: document.getElementById("volume-slider")
	}
	setupPlaybackControls(controls);

	var libraryList = document.getElementById("librarylist");
	var callbackArgs = { list: libraryList };
	loadLibraryDirectory("/", handleJSONData, callbackArgs);
});
