import config from './config.js';
import process from 'process';
import async from 'async';
import fs from 'fs';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import * as pmi from 'pmi.js';
import * as winRT from "@xan105/nodert";

const control = winRT.media.control;

var previous = ""; //The name of the previous song, for redundancy
var session; //Our current session
var sessionManager; //Our session manager
var connected = 0;

//Picarto
const opts = {
    identity: {
      username: config.picarto_username,
      password: config.picarto_password
    }
  };

const client = new pmi.client(opts);

client.on('connected', onConnectedHandler);

function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:`);
    connected = 1;
}

function displayInfo()
{
    if (session) {
        session.tryGetMediaPropertiesAsync((error, media) => {
            if (media === undefined) { console.warn("Media title not found!"); return; }
            if (media.title == previous) { /*console.log("Redundant title -- Ignoring");*/ return; }
            previous = media.title;
            console.log(`♫ Now playing: "${media.title}" - ${media.artist} ♩♪`);
            if (fs.existsSync(config.music_file)) { fs.writeFile(config.music_file, `♫        "${media.title}" - ${media.artist}       `, err => { if (err) { console.error(err); } }); }
            if (connected) client.say(config.picarto_channel_name, `♫ Now playing: "${media.title}" - ${media.artist} ♩♪`);
        });
    }
}

function setup() {

    async.parallel([
        (callback) => {
            session = null;
            callback(null, 1);
        },
        (callback) => {
            session = sessionManager.getCurrentSession(); //What windows thinks the user is listening to primarily
            callback(null, 2);
        },
        (callback) => {
            if (session) {
                console.log("Listener added: MediaPropertiesChanged");
                session.addListener("MediaPropertiesChanged", (event) => {
                    if (session) displayInfo();
                });
            }
            setTimeout(() => { callback(null, 3); }, 2000);
        },
        (callback) => {
            displayInfo();
            callback(null, 4);
        }
    ], (err, results) => {});
}

control.GlobalSystemMediaTransportControlsSessionManager.requestAsync((error, manager) => {
    try {
        if (error) {
            console.error(error); 
            process.abort;
        }

        sessionManager = manager;

        manager.on("CurrentSessionChanged", (event) => {
            console.log("Event update: The current session has changed");
            if (session) session.removeListener("MediaPropertiesChanged", (event) => { console.log("Listener removed: MediaPropertiesChanged"); });
            setup();
        });           

        setup();
    }
    catch {
        session = null;
    }
});

client.connect();
process.stdin.resume();
