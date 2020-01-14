const { ipcRenderer } = require('electron')

function setVerticalIndicator(selector, value) {
	document.querySelector(selector).querySelector('.needle').style.transform = 'translateY(-' + (value * 145).toString() + 'px)'
}

function setSemicircleIndicator(selector, value) {
	document.querySelector(selector).querySelector('.needle').style.transform = 'rotate(' + ((value * 160) - 80) + 'deg)'
}

function setCircleIndicator(selector, value) {
	document.querySelector(selector).querySelector('.needle').style.transform = 'rotate(' + value + 'deg)'
}

function setValueText(selector, value) {
	document.querySelector(selector).querySelector('.value').innerHTML = value
}

ipcRenderer.on('sensorValues', (event, arg) => {
	const sensors = Object.keys(arg)
	sensors.forEach((sensor) => {
		const value = arg[sensor]
		if (sensor == 'compass') {
			setCircleIndicator('#compass', value)
			setValueText('#compass', value.toFixed(0))
		}
		else if (sensor == 'rudder') {
			setSemicircleIndicator('#rudder', value / 180)
			setValueText('#rudder', value.toFixed(0))
		}
		else if (sensor == 'winch') {
			setVerticalIndicator('#winch', value)
			setValueText('#winch', (value * 100).toFixed(1))
		}
		else if (sensor == 'windspeed') {
			setSemicircleIndicator('#windspeed', value / 100)
			setValueText('#windspeed', value.toFixed(0))
		}
		else if (sensor == 'windvane') {
			setCircleIndicator('#windvane', value)
			setValueText('#windvane', value.toFixed(0))
		}
		else if (sensor == 'gpsspeed') {
			setSemicircleIndicator('#gpsspeed', value / 100)
			setValueText('#gpsspeed', value.toFixed(0))
		}
		else if (sensor == 'gps') {
			document.querySelector('#gps-latitude').innerHTML = value.latitude.toFixed(2)
			document.querySelector('#gps-longitude').innerHTML = value.longitude.toFixed(2)
		}
		else if (sensor == 'temp') {
			setVerticalIndicator('#temp', value / 30)
			setValueText('#temp', value.toFixed(1))
		}
	})
})