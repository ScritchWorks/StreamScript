# StreamScript
A super simple script to run alongside an art stream.

This is really rough, and not meant to be used by anyone other than myself; it may be helpful to someone at best! It does work though.
This script uses the [GlobalSystemMediaTransportControlsSessionManager](https://learn.microsoft.com/en-us/uwp/api/windows.media.control.globalsystemmediatransportcontrolssessionmanager?view=winrt-26100) to read what music is currently playing, save it to a text file that OBS can display, and also posts it to a Picarto chatroom provided the credentials are setup correctly.

There are numerous plugins for OBS that do similar things, but I wanted one that gave me a simple text output so I can set it on a marquee.

## Prereq
- Node
- Visual Studio (Community 2022 edition is fine)
- Python
- https://github.com/Picarto/pmi.js
- https://github.com/xan105/node-nodeRT*
- Windows 11*

*This was written **specifically for Windows 11 22H2+**, you can modify this script to run on older versions easily and I might do that if anyone wants!

## How to setup
- Copy `config.example.js` to `config.js`
- Edit `config.picarto_username` and `config.picarto_password` to your credentials as provided from [here](https://oauth.picarto.tv/chat/bot).*
- Edit `config.picarto_channel_name` to the name of your channel as displayed by `https://picarto.tv/<CHANNHEL NAME>/`*
- Edit `config.music_file` to point to the text file you want the music information sent to!*
- In OBS, create a new `Text(GDI+)` element and set it to the `music.txt` used for the text output!*
- Run `index.js`

*These are all optional

## Notes
- This script does work, but can still be optmized!
- When the playing song has changed, the `previous` variable is populated with the name of the new song to avoid redundant posting. This is a result of what I think is a quirk with the Windows API firing off redundant events. If anyone has more insight as to why this is the case, I would appreciate the insight so that I could optimize it!
- You can edit the formatting of the text used on OBS/Picarto by adjusting lines [42 and 43](https://github.com/ScritchWorks/StreamScript/blob/main/index.js#L42) in [index.js](https://github.com/ScritchWorks/StreamScript/blob/main/index.js).
