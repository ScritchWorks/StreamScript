import config from './config.js';
import process from 'process';
import async from 'async';
import fs from 'fs';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import * as pmi from 'pmi.js';
import * as winRT from "@xan105/nodert";

const control = winRT.media.control;
const status = ["closed", "opened", "changing", "stopped", "playing", "paused"];

var previous = "";
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

//client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:`);
    connected = 1;
}

function onMessageHandler (target, context, msg, self) {
    //if (self) { return; } /* Ignore messages from the bot */
  
    // const commandName = msg;
    // console.log(`${target} - ${msg}`);
    /* If the command is known, let's execute it */
    // if (commandName === '!hello') {
    //   client.say(target, sayHello());
    //   console.log(`* Executed ${commandName} command`);
    // } else {
    //   console.log(`* Unknown command ${commandName}`);
    // }
  }

function displayInfo()
{
    if (session) {
        session.tryGetMediaPropertiesAsync((error, media) => {
            if (media === undefined) { console.warn("Media title not found!"); return; }
            if (media.title == previous) { /*console.log("Redundant title -- Ignoring");*/ return; }
            previous = media.title;
            //info.title = media.title;
            //info.artist = media.artist;
            //getThumbnail(media.thumbnail);
            // console.log(media.albumArtist);
            // console.log(media.albumTitle);
            // console.log(media.albumTrackCount);
            console.log(media.artist);
            //console.log(media.genres);
            //console.log(media.subtitle);
            console.log(media.title);
            if (fs.existsSync(config.music_file)) { fs.writeFile(config.music_file, `♫        "${media.title}" - ${media.artist}       `, err => { if (err) { console.error(err); } }); }
            if (connected) client.say(config.picarto_channel_name, `♫ Now playing: "${media.title}" - ${media.artist} ♩♪`);
        });
    }
    else {
        //console.warn("session not found!");
    }
}

function setup() {

    async.parallel([
        (callback) => {
            //console.log("Running part 1");
            session = null;
            callback(null, 1);
        },
        (callback) => {
            //console.log("Running part 2");
            //console.log("Attempting to get current session...");
            session = sessionManager.getCurrentSession(); //What windows thinks the user is listening to primarily
            callback(null, 2);
        },
        (callback) => {
            //console.log("Running part 3");
            if (session) {
                console.log("Listener added: MediaPropertiesChanged");
                session.addListener("MediaPropertiesChanged", (event) => {
                    if (session) {
                        let playback = session.getPlaybackInfo();
                        // console.log(playback.playbackStatus);
                        // console.log(status[playback.playbackStatus]);
                        //console.log('Event: MediaPropertiesChanged Changed');
                        displayInfo();
                    }
                });
            } else {
                //console.warn("session not found!");
            }
            setTimeout(() => { callback(null, 3); }, 2000);
        },
        (callback) => {
            //console.log("Running part 4");
            displayInfo();
            callback(null, 4);
        }
    ], (err, results) => {});
}

control.GlobalSystemMediaTransportControlsSessionManager.requestAsync((error, manager) => {
    try {
        if (error) {
            console.error(error); process.abort;
        }

        sessionManager = manager;

        manager.on("CurrentSessionChanged", (event) => {
            console.log("Event update: The current session has changed");
            if (session) session.removeListener("MediaPropertiesChanged", (event) => { console.log("Listener removed: MediaPropertiesChanged"); });
            setup();
        });           
        // manager.on("SessionsChanged", (event) => {
        //     console.log("Event update: The session has changed");
        //     hookInfo();
        // });   
        
        setup();

    }
    catch {
        session = null;
    }
});

client.connect();
process.stdin.resume();