from os import listdir, walk
from os.path import isfile, join, isdir, getsize
from pathlib import Path
import hashlib
import sys
import os
import shutil
import pwd
import grp

uid = pwd.getpwnam("ievgenmelnychuk")[2]
gid = grp.getgrnam("staff")[2]

# from hurry import filesize

print('Hello')

mypath = '/Volumes/SSD512'
deleteFolder = '/Volumes/SSD512/trashed'

trashFolders = [
    '/Volumes/SSD512/_Ukraine/Kharkiv/else',
    '/Volumes/SSD512/_Ukraine/Else',
    '/Volumes/SSD512/_Ukraine/Kherson/else',
    '/Volumes/SSD512/Backups From iPhone'
]

class file:
    path = ''
    size = 0
    hash = ''
    def __init__(self, path):
        self.path = path
        with open(self.path, 'rb') as file_to_check:
            # read contents of the file
            try:
                data = file_to_check.read(5 * 1024) # only first 10 KBytes
                self.hash = hashlib.md5(data).hexdigest()
                self.size = getsize(path)
            except:
                print("Unexpected error:", sys.exc_info()[0])
                self.size = 0

            # pipe contents of the file through
            


def getfilenames(path):
    totalSize = 0
    paths = []
    for (dirpath, _, filenames) in walk(path):
        if (dirpath == deleteFolder):
            continue
        for filename in filenames: 
            if filename.find('.DS_Store') != -1:
                continue
            fullPath = join(dirpath, filename)
            paths.append(fullPath)
            size = getsize(fullPath)
            totalSize += size
    return [paths, totalSize]

def appendFilesFromPath(path, toHashSize):
    hashedSize = 0
    for (dirpath, _, filenames) in walk(path):
        if (dirpath == deleteFolder):
            continue
        for filename in filenames: 
            if filename.find('.DS_Store') != -1:
                continue
            fullPath = join(dirpath, filename)
            processing = file(fullPath)
            hashedSize += processing.size
            allFiles.append(processing)
            # added = len(allFiles)
            print(f'Hashed {len(allFiles)} files, {(hashedSize)} bytes, {hashedSize/toHashSize*100}%')
            # if (len(allFiles) >= 10000):
            #     return

print('getting filenames...')
filenames = getfilenames(mypath)
print(f'got {len(filenames[0])} files to compare, {filenames[1]} bytes')
if (len(filenames) > 0):
    allFiles = []
    appendFilesFromPath(mypath, filenames[1])
S = {} 
dupHashes=[]
dupCount=0
dupSize=0
for hashedFile in allFiles:
    if hashedFile.hash not in S:
        S[hashedFile.hash] = [hashedFile]
    else:
        S[hashedFile.hash].append(hashedFile)
        dupHashes.append(hashedFile.hash)
        dupCount += 1
        dupSize += hashedFile.size
if (dupCount > 0):
    print(f'Duplicates: {dupCount} for {(dupSize)} bytes')
else:
    print('No duplicates')

counter = 1

toBeTrashed = []
unresolved = []

for dup in dupHashes:
    dupCollection = S[dup]
    mainBelongsToTrashFolders = False
    for trashPath in trashFolders:
        if dupCollection[0].path.find(trashPath) != -1:
            mainBelongsToTrashFolders = True
    if mainBelongsToTrashFolders:
        toBeTrashed.append(dupCollection[0])
        if len(dupCollection) > 2:
            keep = dupCollection[1]
            rest = len(dupCollection) - 2
            toBeTrashed += dupCollection[-rest:]
    else:
        unresolved.append(dupCollection[0])
    print(f'{counter}. File: {dupCollection[0].path}, size: {dupCollection[0].size}')
    print('Duplicates:')
    last = len(dupCollection) - 1
    oneOfDupsInTrash = False
    for dup in dupCollection[-last:]:
        belongsToTrashFolders = False
        for trashPath in trashFolders:
            if dup.path.find(trashPath) != -1:
                belongsToTrashFolders = True
                oneOfDupsInTrash = True
        if belongsToTrashFolders and not mainBelongsToTrashFolders:
            toBeTrashed.append(dup)
        else:
            unresolved.append(dup)
        print(f'File: {dup.path}, size: {dup.size}')
    if not mainBelongsToTrashFolders and not oneOfDupsInTrash:
        rest = len(dupCollection) - 1
        toBeTrashed += dupCollection[-rest:]

    counter += 1
print('To be trashed:')
counter = 1
for trashFile in toBeTrashed:
    print(f'{counter}. {trashFile.path}, size {trashFile.size}')
    counter += 1
print('Unresolved:')
counter = 1
for trashFile in unresolved:
    print(f'{counter}. {trashFile.path}, size {trashFile.size}')
    counter += 1

moved = 0
movedSize = 0
for fileToTrash in toBeTrashed:
    import ntpath
    moved += 1
    movedSize += fileToTrash.size
    filename = ntpath.basename(fileToTrash.path)
    destination = join(deleteFolder, filename)
    if os.path.isfile(fileToTrash.path):
        os.chown(fileToTrash.path, uid, gid)
        os.rename(fileToTrash.path, destination)
print(f'Moved to [{deleteFolder}] {moved} files, {movedSize} bytes')
