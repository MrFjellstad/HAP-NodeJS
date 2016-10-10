var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;



var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://127.0.0.1');
 
client.on('connect', function () {
  client.subscribe('presence');
  client.publish('presence', 'Hello mqtt');
  client.subscribe('garasje/temp');
  console.log('connect');
});
 
client.on('message', function (topic, message) {
  // message is Buffer 
  console.log(topic + ' - ' + message);
  FAKE_SENSOR.currentTemperature = parseFloat(message);
//  client.end();
});




// here's a fake temperature sensor device that we'll expose to HomeKit
var FAKE_SENSOR = {
  currentTemperature: 0,
  getTemperature: function() { 
    console.log("Getting the current temperature!");
    return FAKE_SENSOR.currentTemperature;
  },
  randomizeTemperature: function() {
    // randomize temperature to a value between 0 and 100
    // FAKE_SENSOR.currentTemperature = Math.round(Math.random() * 100);
    // console.log(FAKE_SENSOR.currentTemperature);
  }
}


// Generate a consistent UUID for our Temperature Sensor Accessory that will remain the same
// even when restarting our server. We use the `uuid.generate` helper function to create
// a deterministic UUID based on an arbitrary "namespace" and the string "temperature-sensor".
var sensorUUID = uuid.generate('hap-nodejs:accessories:temperature-sensor');

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake lock.
var sensor = exports.accessory = new Accessory('Temperature Sensor', sensorUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
sensor.username = "C1:5D:3A:AE:5E:FA";
sensor.pincode = "031-45-154";

// Add the actual TemperatureSensor Service.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
sensor
  .addService(Service.TemperatureSensor)
  .getCharacteristic(Characteristic.CurrentTemperature)
  .on('get', function(callback) {
    
    // return our current value
    callback(null, FAKE_SENSOR.getTemperature());
  });

// randomize our temperature reading every 3 seconds
setInterval(function() {
  
  FAKE_SENSOR.randomizeTemperature();
  
  // update the characteristic value so interested iOS devices can get notified
  sensor
    .getService(Service.TemperatureSensor)
    .setCharacteristic(Characteristic.CurrentTemperature, FAKE_SENSOR.currentTemperature);
  
}, 3000);
