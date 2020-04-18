(async function () {
  require('dotenv').config()

  const express = require('express')
  const app = express()
  const cors = require('cors')
  const bodyParser = require('body-parser')
  const http = require('http').Server(app)

  const SNAP_SERVER_IP = process.env.SNAP_SERVER_IP || 'localhost'
  const SNAP_SERVER_PORT = process.env.SNAP_SERVER_PORT || '1705'
  const SERVER_PORT = process.env.SERVER_PORT || '80'

  // Ajout des middlewares
  app.use(cors())
  app.use(bodyParser.json())

  // Sert le dossier static
  app.use(express.static(__dirname + '/static'))

  // Initialisation de l'API Json RCP
  await require('./src/json-rcp').connect(SNAP_SERVER_IP, SNAP_SERVER_PORT)

  // Initialise l'handler d'event du serveur
  await require('./src/snap-service/snap-events')()

  // Lance l'action d'initialisation du serveur
  await require('./src/snap-service/snap-actions').init()

  // Initialisation de l'API Rest
  app.use('/api', require('./src/api'))

  http.listen(SERVER_PORT, () => console.log('listening on *:' + SERVER_PORT))
}())