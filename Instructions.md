### Requirements

Node.js: https://nodejs.org/en
Install the above

### Setting up

You will be emailed a link to a site called github with a link. Click it and download the folder as a zip to the location of your choosing. (Under code dropdown as zip file).

Go to this location in your file explorer and extract the files from te zip file.

Once complete, go into the project folder.

Windows: Go to the top where it shows the file path (where all the layers of files are shown) and type 'cmd' and hit enter. A command prompt will pop up.
Mac: Right click on the folder and select new terminal at Folder.

Now you are ready for the next steps.

### Running
When running for the first time, run 'npm install' in the terminal.

1. Copy the contents of the Azure file from 10.0.0.9 and the other file into Azure.html and Other.html respectively. (Found under HTMLFiles folder).
2. Make sure to save the above.
3. In the terminal type npx tsc and wait (This may take ~15 seconds).
4. Run the command 'node .\dist\Main.js'
5. From here, it will print all variables from both, along with other information. Then, one by one it will iterate through prompting you to enter the match.
6. In the terminal, once complete, it will print out the variables that remained unmatched and may need to be found elsewhere or created.
7. Once complete, go over to NewFile.html and copy the contents out.
