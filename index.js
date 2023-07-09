const express = require('express');
const bodyParser = require('body-parser');
const PDFServicesSdk = require('@adobe/pdfservices-node-sdk');
const app = express();
var path = require("path");
fs = require('fs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

app.get('/', function(req,res){
    res.sendFile(path.join(__dirname,'./index.html'));
  });
let outputFilePath = ""
// sample object same as sample resume_template json
var obj = {    
        Name: "Lorem",
        LastName: "ipsum",
        EmailAddress: "ipsum@abc.com",
        PhoneNumber: "+91 99xx14xx99",
        LinkedIn: "<a href=\"https://www.linkedin.com\">linkedIn</a>",
        JobTitle: "Software Development Engineer",
        Summary : "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.",
        Skills: [
          "Java", 
          "Data Structure", 
          "ReactJs"
        ],
        Education: [
          {
            "SchoolName": "School",
            "Year": "201X-201Y",
            "Description" : "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable."
          }
        ],
        Experience: [
          {
            "CompanyName": "Adobe",
            "Year": "201X-201Y",
            "Description" : "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout."
          }
        ],
        Achievements: [
          {
            "Type" : "Academics",
            "Description" : "Lorem ipsum dolor sit amet"
          }
        ]     
  }
//post request 
app.post('/resume', async (req, res) => {
    await call(req,res);
    if(outputFilePath != undefined){
    var data = fs.readFileSync(outputFilePath);
    res.contentType("application/pdf");
    res.setHeader('Content-Type', 'application/pdf');
    res.send(data);
    }
});

const port = 8080;

app.listen(port, () => {
  console.log(`Server running on port${port}`);
});

async function call(req,res){
  //checking if request has all required fields
  if(req.body.template_id==undefined || req.body.personal_information.name == undefined || req.body.personal_information.last_name == undefined ||
    req.body.personal_information.email_address == undefined || req.body.personal_information.phone_number==undefined ||
     req.body.personal_information.linkedin_url==undefined || req.body.job_title == undefined || req.body.career_objective ==undefined ||
     req.body.skills == undefined || req.body.education == undefined || req.body.experience == undefined || req.body.achievements == undefined){
      outputFilePath = undefined; 
      return res.status(400).send("Bad request");
     }
  //fetching info from req.body and storing in same format as sample json  
  obj['Name'] = req.body.personal_information.name,
  obj['LastName'] = req.body.personal_information.last_name, 
  obj['EmailAddress'] =  req.body.personal_information.email_address ,
  obj['PhoneNumber'] = req.body.personal_information.phone_number ,
  obj['LinkedIn'] =   req.body.personal_information.linkedin_url ,
  obj['JobTitle'] = req.body.job_title,
  obj['Summary'] = req.body.career_objective,
  obj['Skills'] = req.body.skills
  //fetching array of objects using for loop
  var obj1= []
 for(var i =0;i<req.body.education.length;i++){
      
      if(req.body.education[i].school_name!="" && req.body.education[i].passing_year!="" && req.body.education[i].description!=""){
      var o = {}
      o['SchoolName'] = req.body.education[i].school_name;
      o['Year'] = req.body.education[i].passing_year;
      o['Description'] = req.body.education[i].description;
      obj1.push(o);
      }else{
        if(i==0){
          return res.status(400).send("Bad request");
        }
      }     
  }
      obj['Education']=obj1

      var obj2 = []
    //printing chosen template number in console
     
      console.log(req.body.template_id);
    //fetching array of objects using for loop
  for(var i=0;i<req.body.experience.length;i++){
     if(req.body.experience[i].company_name!="" && req.body.experience[i].passing_year!="" && req.body.experience[i].responsibilities!=""){
      var o = {}
      o['CompanyName'] = req.body.experience[i].company_name;
      o['Year'] = req.body.experience[i].passing_year;
      o['Description'] = req.body.experience[i].responsibilities;
      obj2.push(o);
    }else{
      if(i==0){
        return res.status(400).send("Bad request");
      }
    }
  }
      obj['Experience']=obj2;
  var obj3 = []
  //fetching array of objects using for loop
  for(var i =0;i<req.body['achievements'].length;i++){
    if(req.body.achievements[i].field!="" && req.body.achievements[i].awards!=""){
      var o = {}
      o['Type'] = req.body.achievements[i].field;
      o['Description'] = req.body.achievements[i].awards;
      obj3.push(o);
    }else{
      if(i==0){
        return res.status(400).send("Bad request");
      }
    }
  }
      obj['Achievements']=obj3;
  // converting all data in jsonstring
  var jsonString = JSON.stringify(obj);
  //block to handle pdf merfging
  try {
    // Initial setup, create credentials instance.
    const credentials =  PDFServicesSdk.Credentials
        .servicePrincipalCredentialsBuilder()
        .withClientId(process.env.PDF_SERVICES_CLIENT_ID)
        .withClientSecret(process.env.PDF_SERVICES_CLIENT_SECRET)
        .build();
    //if credentials not matched return error
    if(!credentials){
       outputFilePath = undefined
       return res.status(401).send("Unauthorised")      
    }
    //if template not matched return error
    if(req.body.template_id!="1" && req.body.template_id!="2" && req.body.template_id!="3" || req.body.template_id == undefined){
        outputFilePath = undefined
        return res.status(404).send("Template not found");        
     }
    // Setup input data for the document merge process
        jsonDataForMerge = JSON.parse(jsonString);

    // Create an ExecutionContext using credentials
    const executionContext = PDFServicesSdk.ExecutionContext.create(credentials);

    // Create a new DocumentMerge options instance
    const documentMerge = PDFServicesSdk.DocumentMerge,
        documentMergeOptions = documentMerge.options,
        options = new documentMergeOptions.DocumentMergeOptions(jsonDataForMerge, documentMergeOptions.OutputFormat.PDF);

    // Create a new operation instance using the options instance
    const documentMergeOperation = documentMerge.Operation.createNew(options)

    // Set operation input document template from a source file.
    var input = ""
    if(req.body.template_id == "1")
      input = PDFServicesSdk.FileRef.createFromLocalFile('resources/Template1/BasicTemplate.docx');
    else if(req.body.template_id == "3")
      input = PDFServicesSdk.FileRef.createFromLocalFile('resources/Template3/LinkTemplate.docx');
     else if(req.body.template_id == "2")
      input = PDFServicesSdk.FileRef.createFromLocalFile('resources/Template2/ImageTemplate.docx');

    documentMergeOperation.setInput(input);

    //Generating a file name
    outputFilePath = createOutputFilePath();

    // Execute the operation and Save the result to the specified location.
    const rew = await documentMergeOperation.execute(executionContext)
        .then(result => result.saveAsFile(outputFilePath))
        .catch(err => {
            if(err instanceof PDFServicesSdk.Error.ServiceApiError
                || err instanceof PDFServicesSdk.Error.ServiceUsageError) {
                console.log('Exception encountered while executing operation', err);
                outputFilePath = undefined
                return res.status(500).send("Internal Server error");
            } else {
                console.log('Exception encountered while executing operation', err);
                outputFilePath = undefined
                return res.status(500).send("Internal Server error");
            }
        });

    //Generates a string containing a directory structure and file name for the output file.
    function createOutputFilePath() {
      let date = new Date();
        let dateString = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" +
            ("0" + date.getDate()).slice(-2) + "T" + ("0" + date.getHours()).slice(-2) + "-" +
            ("0" + date.getMinutes()).slice(-2) + "-" + ("0" + date.getSeconds()).slice(-2);
        return ("output/merge" + dateString + ".pdf");
    }
}catch (err) {
    console.log('Exception encountered while executing operation', err);
    outputFilePath = undefined
    return res.status(500).send("Internal Server error");
} 
}