#!/usr/bin/python3

import cgi
import os
import json
import glob

form = cgi.FieldStorage()

print("Content-type: text/html\n")
if "dir" in form:
	basedir = "../library/" + form["dir"].value
	dirlist = os.listdir(basedir)
	directories = [d for d in dirlist if os.path.isdir(basedir + "/" + d)]
	#files = [f for f in dirlist if not os.path.isdir(basedir + "/" + f)]
	files = [os.path.basename(f) for f in glob.glob(basedir + "/*.mp3")]
	jsonData = {"directories": sorted(directories), "files": sorted(files)}
	print(json.dumps(jsonData))
