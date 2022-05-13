# track-visualisation

[Access a live version here](https://tureptor.github.io/track-visualisation/)  
OR [download a copy of the repository here](https://github.com/tureptor/track-visualisation/archive/refs/heads/main.zip), unzip, and open index.html

All code is client-side, so there is no difference between these two options.

## Usage guide

1. Click "Choose File", then browse and select the JSON file you wish to visualise.
2. Click "Start processing". This will parse the JSON file and plot the track on the map.

Each markers' colour is dependant on the device's battery level at that given point. Red = low battery, green = high battery.  Path colours between two markers are based of the first marker's colour.  
Markers can be clicked to display the date/time of that point, as well as the specific battery level.

Now, you can freely alter the options.

## Description of options

Min horizontal accuracy:  
This lets you choose a threshold to filter points by. If it is set to 50, only points with 50m accuracy or better are shown

Reflect accuracy in marker size?:  
If enabled, then markers will reflect the range of where each point could be. The circles are to scale.  
If disabled, then markers will all be the same fixed size.

Group points within x seconds of neighbours into a single point:  
If two points are within the chosen threshold, then only the most accurate of those two points will be plotted.  
Example: points with a timestamp 15, 16, 18, 20, 25, 30 seconds.  
If the threshold is set to 3, then they will be grouped into (15,16,18,20), (25), (30) so only 3 points will be plotted.  

Layers:  
In the top right of the map, you can select between different tile sets, such as a satellite map or a topographical map. You can also show features like streets and city labels, or nautical features like lighthouses.

Fullscreen/Zoom:
In the top left of the map, you can zoom in/out, or enter fullscreen. To exit fullscreen, just click the button again.
