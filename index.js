const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

const sensors = {
	'GP': {
		id: 'gps',
		parser: (data) => {
			const parts = data.split(',')
			return {
				latitude: parseFloat(parts[0]),
				longitude: parseFloat(parts[1])
			}
		}
	},
	'CP': {
		id: 'compass',
		parser: (data) => parseFloat(data)
	},
	'TM': {
		id: 'temp',
		parser: (data) => parseFloat(data)
	},
	'WV': {
		id: 'windvane',
		parser: (data) => parseInt(data)
	},
	'PX': {

	},
	'LD': {

	},
	'SP': {
		id: 'gpsspeed',
		parser: (data) => parseFloat(data)
	},
	'WS': {
		id: 'windspeed',
		parser: (data) => parseFloat(data)
	}
}
const sensorValues = {}
const logMessages = []

function writeLogMessage(message) {
	logMessages.push(message.toString())
}

function setAutopilot(port, value) {
	if (value) {
		port.write('A01;')
	}
	else {
		port.write('A00;')
	}
}

function setRudder(port, value) {
	port.write('SR' + value.toString() + ';')
}

function setWinch(port, value) {
	port.write('SW' + value.toString() + ';')
}

ipcMain.on('setWinch', (event, arg) => {

})

ipcMain.on('setRudder', (event, arg) => {
	
})

app.on('ready', async ()=> {
	const win = new BrowserWindow({
		width: 1024,
		height: 768,
		webPreferences: {
			preload: path.join(app.getAppPath(), 'control.js')
		}
	})

	win.setMenuBarVisibility(false)

	win.loadFile('index.html')

	setInterval(() => {
		sensorValues['compass'] = Math.random() * 360
		sensorValues['rudder'] = Math.random() * 180
		sensorValues['winch'] = Math.random()
		sensorValues['windspeed'] = Math.random() * 100
		sensorValues['windvane'] = Math.random() * 360
		sensorValues['temp'] = Math.random() * 30
		sensorValues['gpsspeed'] = Math.random() * 50
		sensorValues['gps'] = {
			latitude: (Math.random() * 180) - 90,
			longitude: (Math.random() * 360) - 180
		}
		win.webContents.send('sensorValues', sensorValues)
	}, 1000)

	const ports = await SerialPort.list()
	const bestPort = ports.find((port) => {
		return port.manufacturer == 'XBEE'
	})
	if (!bestPort) {
		console.log('XBEE not connected')
		return
	}
	const port = new SerialPort(port.path, {
		baudRate: 9600
	})

	const lineStream = port.pipe(new Readline())

	lineStream.on('data', (message) => {
		const cleanMessage = message.split(';')[0]
		const command = cleanMessage.substr(0, 2)
		const data = cleanMessage.substr(2)
		if (sensors[command]) {
			sensorValues[sensors[command].id] = sensors[command].parse(data)
			win.webContents.send('sensorValues', sensorValues)
		}
		else if (command == '00') {
			// heartbeat - should send response
			port.write('001;')
			sensorValues.lastHeartbeat = (new Date()).toString()
		}
		else if (command == '01') {
			// boot up
			writeLogMessage('Received SailCore boot up message')
		}
		else if (command == '09' || command == 'A9') {
			// autopilot is disengaged - raspberry pi is dead
		}
	})
})