# track-visualisation

[Access a live version here](https://tureptor.github.io/track-visualisation/)  
OR [download a copy of the repository here](https://github.com/tureptor/track-visualisation/archive/refs/heads/main.zip), unzip, and open index.html

All code is client-side, so there is no difference between these two options.

## Usage guide

1. Click "Choose File", then browse and select the JSON file you wish to visualise.
2. Click "Start processing". This will parse the JSON file and plot the track on the map.

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
