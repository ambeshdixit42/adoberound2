## Authentication Setup

The credentials file for the samples is ```pdfservices-api-credentials.json```.

1. For MacOS/Linux Users :
```$xlst
export PDF_SERVICES_CLIENT_ID=<YOUR CLIENT ID>
export PDF_SERVICES_CLIENT_SECRET=<YOUR CLIENT SECRET>
```

2. For Windows Users :
```$xlst
set PDF_SERVICES_CLIENT_ID=<YOUR CLIENT ID>
set PDF_SERVICES_CLIENT_SECRET=<YOUR CLIENT SECRET>
```
######
        => Code is present in index.js file and UI in index.html
        NOTE => setup client_id each time before running server
######

1. run node index.js
2. Goto browser type : "http://localhost:8080/" it will open up index.html file.
3. Choose template by clicking on it and viewing, enter all data and click on Submit.
4. Resume will be created and pdf will be displayed on screen.
5. To provide curl request open different terminal copy the curl code and enter template number as desired as 1,2,3 and press enter 
6. Resume will be created.

################ API ###############

1. Created server by doing npm init
2. Used express.js for middelware and routing purpose
3. GET request by "/" provides index.html on browser
4. POST request by "/resume" sends command to create pdf

################ UI ################

Created a HTML form and used JS to handle form-data