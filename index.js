//import express
const express = require("express");
//import ffmpeg
const ffmpeg = require("fluent-ffmpeg");
//import bodyParser
const bodyParser = require("body-parser");

const fs = require("fs");
//for file upload
const fileUpload = require("express-fileupload");

const app = express();
//port no
const PORT = process.env.PORT || 5000

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
//set poth from local foe ffmpeg conversion
ffmpeg.setFfmpegPath("C:/PATH_PROGRAMS/ffmpeg.exe");

ffmpeg.setFfprobePath("C:/PATH_PROGRAMS");

console.log(ffmpeg);
//for getting html file
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

//after the convert button click
app.post("/convert", (req, res) => {

  let to = req.body.to;
  let file = req.files.file;
  let fileName = `output.${to}`;
  console.log(to);
  console.log(file);
//mv function for upload
  file.mv("tmp/" + file.name, function (err) {
    if (err) return res.sendStatus(500).send(err);
    console.log("File Uploaded successfully");
  });
//create file in temp folder and download after conversion
  ffmpeg("tmp/" + file.name)
    .withOutputFormat(to)
    .on("end", function (stdout, stderr) {
      console.log("Finished");
      res.download(__dirname + fileName, function (err) {
        if (err) throw err;
//after conversion file is deleted
        fs.unlink(__dirname + fileName, function (err) {
          if (err) throw err;
          console.log("File deleted");
        });
      });
      fs.unlink("tmp/" + file.name, function (err) {
        if (err) throw err;
        console.log("File deleted");
      });
    })
    .on("error", function (err) {
      console.log("an error happened: " + err.message);
      fs.unlink("tmp/" + file.name, function (err) {
        if (err) throw err;
        console.log("File deleted");
      });
    })
    .saveToFile(__dirname + fileName);
  
});

app.listen(PORT);