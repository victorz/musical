#!/usr/bin/python3

import cgi
import os
import json

form = cgi.FieldStorage()

library = None
print("Content-type: text/html\n")
if "dir" in form:
	files = os.listdir("../library/" + form["dir"].value)
	print(json.dumps(files))
