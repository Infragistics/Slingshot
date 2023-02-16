# Slingshot Outlook Add-in (React) - Create a task from email

## Prerequisites
1. node & npm
2. Outlook account
3. Slingshot account 
4. Visual Studio Code (optional)

## Setting up the add-in
1. clone/download this repository
2. open the project in Visual Studio Code (or cmd)
3. run ```npm install``` to install all dependencies
4. run ```npm run start``` to start the app server
5. open the Outlook app or website
6. click ```Get add-ins```
7. select ```My add-ins``` -> ```Add a custom add-in``` -> ```Add from File...``` 
8. locate and open the manifest.xml file then close the add-ins management modal

## Using the add-in
1. open any email item and from the add-ins menu select ```Create a Slingshot Task```
2. you'll be presented with an authorization screen, head over to Slingshot and create an API key
3. paste that key into the input field and hit ```Authorize```
4. all that's left is to create a task :)

#
You can learn more about Slingshot and find the API docs here: https://www.slingshotapp.io/en/help/docs/welcome-slingshot

Or try out the API yourself here: https://my.slingshotapp.io/v1/api-browser/index.html
#

## Copyright
(c) Copyright 2019 INFRAGISTICS. All rights reserved.