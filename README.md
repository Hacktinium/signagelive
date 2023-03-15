PLAN:

[x] Research IndexedDB
[x] Install deps (library for IndexedDB?)
[] Create carousel / player
[x] Create playlist file (JSON)
[x] Create Assets folder / add media files
[x] Check support for IndexedDB / display err msg if not supported
[x] Check for presence of a 'has run' flag in db

  If flag is NOT present:
    [x] Download 'playlist' JSON file & store in the database
    [x] Get asset location from 'playlist' file.
    [x] Download each media asset specified (using file loc) and store in db
    [x] Update 'playlist' w/ new db location for each asset

  If flag IS present:
    [] Read 'playlist' from db to obtain asset locations and display duration
    [] Read each asset from db and display in carousel for specified duration

QUESTIONS:

? How difficult is IndexedDB to use? Is there a library I can use?
  
  localForage library looks promising. It's also promise-based.

? How to 'download' files and store in DB?

  I think I can use the fetch API to download the files, then store them in the DB using setItem()? I'll need to look into this more...