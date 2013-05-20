#!/usr/bin/python3

import cgi
import os
import json
import glob

form = cgi.FieldStorage()

if "dir" in form:
	jsonData = dict();
	if ".." in form["dir"].value:
		jsonData["status"] = "INVALID_DIR"
		jsonData["error"] = "\"..\" in directory is not allowed"
	else:
		basedir = "../library/" + form["dir"].value
		dirlist = os.listdir(basedir)
		directories = [d for d in dirlist if os.path.isdir(basedir + "/" + d)]
		files = [os.path.basename(f) for f in glob.glob(basedir + "/*.mp3")]
		jsonData["status"] = "OK"
		jsonData["directories"] = sorted(directories)
		jsonData["files"] = sorted(files)
	print("Content-type: text/html;charset=utf-8\n")
	print(json.dumps(jsonData))
