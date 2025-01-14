var request = require("request");
const { Client } = require("pg");

// PARTICLE PHOTON
var device_id = process.env.PHOTON_ID;
var access_token = process.env.PHOTON_TOKEN;
var particle_variable = "json";
var device_url =
  "https://api.particle.io/v1/devices/" +
  device_id +
  "/" +
  particle_variable +
  "?access_token=" +
  access_token;

// AWS RDS POSTGRESQL INSTANCE
var db_credentials = new Object();
db_credentials.user = "andrewL";
db_credentials.host = process.env.AWSRDS_EP;
db_credentials.database = "mydatabase";
db_credentials.password = process.env.AWSRDS_PW;
db_credentials.port = 5432;

var getAndWriteData = function() {
  // Make request to the Particle API to get sensor values
  request(device_url, function(error, response, body) {
    // Store sensor values x, y and z for accelerometer in 3 variables
    var svX = JSON.parse(body).result[0]["x"];
    var svY = JSON.parse(body).result[0]["y"];
    var svZ = JSON.parse(body).result[0]["z"];

    var sv = JSON.parse(body).result;
    console.log(sv);

    // Connect to the AWS RDS Postgres database
    const client = new Client(db_credentials);
    client.connect();

    // Construct a SQL statement to insert sensor values into a table
    var thisQuery =
      "INSERT INTO sensorData VALUES (" +
      svX +
      ", " +
      svY +
      ", " +
      svZ +
      ", DEFAULT);";

    console.log(thisQuery); // for debugging

    // Connect to the AWS RDS Postgres database and insert a new row of sensor values
    client.query(thisQuery, (err, res) => {
      console.log(err, res);
      client.end();
    });
  });
};
getAndWriteData();

// write a new row of sensor data every five minutes
setInterval(getAndWriteData, 300000);

// write a new row of sensor data 10 times a second when running. Will not always keep running. Only running when pulling values about 5 min a day.
// setInterval(getAndWriteData, 100);
