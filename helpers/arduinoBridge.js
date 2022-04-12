const config = require('../config.json');
const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')
var port;

if(config.arduino_port != ""){
	port = new SerialPort({ path: config.arduino_port, baudRate: 9600 })
	port.flush(function(err,results){});
	const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

	moisture = 0;

	parser.on('data', data =>{
	  var splitData = data.split("=");
	  if(splitData[0] == "m"){
		  moisture = splitData[1];
	  }
	});

}

module.exports.getMoisture= () => {
  return moisture;
}

module.exports.getFanState= () => {
  return fan_state;
}


module.exports.waterThePlant= () => {
	if(port != null){
		port.write('wtr\n', (err) => {
			if (err) {
				return console.log('Error on writing to arduino port: ', err.message);
			}
		});
	}
}

module.exports.fanspeed = (fan_speed) => {
	if(port != null){
		port.write('f'+fanSpeedMap(fan_speed)+'\n', (err) => {
			if (err) {
				return console.log('Error on writing to arduino port: ', err.message);
			}
		});
	}
}


function fanSpeedMap(percentage_fan_speed){
	fanSpeedMapped = config.fan_speed_min_value + (percentage_fan_speed / 100 * (config.fan_speed_max_value - config.fan_speed_min_value));
	if (fanSpeedMapped <= config.fan_speed_min_value) {
		fanSpeedMapped = 0;
	}
	if(fanSpeedMapped >= config.fan_speed_max_value - 10){
		fanSpeedMapped = config.fan_speed_max_value;
	}
	return fanSpeedMapped;
}
