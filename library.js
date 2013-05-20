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

function populateList(list, elements) {
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
	playFile(e.target.parentNode.getAttribute("data-path") + "/" + e.target.textContent)
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
		populateList(args.list, directories);
	}
	if (files && files.length) {
		addEventListeners(files, fileClicked, "click");
		populateList(args.list, files);
	}
}

function playFile(path) {
	audio.src = "library" + path;
	audio.play();
}

window.addEventListener("load", function() {
	audio = document.getElementById("audio");
	var libraryList = document.getElementById("librarylist");
	var callbackArgs = { list: libraryList };
	loadLibraryDirectory("/", handleJSONData, callbackArgs);
});
