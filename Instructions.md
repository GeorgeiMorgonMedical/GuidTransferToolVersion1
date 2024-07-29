### Requirements

Node.js: https://nodejs.org/en/blog/release/v22.4.1
Install the above

### Setting up

You will be emailed a link to a site called github with a link. Click it and download the folder as a zip to the location of your choosing. (Under code dropdown as zip file). The latest version will be under the main branch.

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
5. From here, look inside the Txts folder. There will be two txts containing the extracted variables. Input the matches in userInput.txt and save.
6. When done, run the command node .\dist\Main2.js.
7. The contents of the new HTML file will be in the NewFile.html under HTML files.
8. The contents of userInput will be overwritten, so if you would like, you may copy that txt and save it elsewhere.
