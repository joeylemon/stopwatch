/*
Author: Joey Lemon
Date: Oct. 7, 2018

Written for ClickTime's software development coding exercise
*/



// Initialize the canvas
var canvas = document.getElementById("canvas");
canvas.width = 300;
canvas.height = 300;
var ctx = canvas.getContext("2d");
// Set the center of the canvas as (0, 0)
// Adding 0.5 makes lines sharper
ctx.translate(150.5, 152.5);
// Round off the ends of lines
ctx.lineCap = "round";

// Check if geolocation is available
var geo = false;
if("geolocation" in navigator){
    geo = true;
}

// Ask for permission to find location
if(geo){
    navigator.geolocation.getCurrentPosition(function(position) {
        console.log(position.coords);
    },
    function (error) { 
        if(error.code == error.PERMISSION_DENIED){
            geo = false;
        }
    });
}

// Initialize the history array
var data = new Array();
if(localStorage.getItem("history") != null){
    // Put previous data in the array if it exists
    data = JSON.parse(localStorage.getItem("history"));
    updateTotalPages();
    updateTable();
}else{
    // Hide the table buttons if there is no history to reset
    $("#reset").hide();
    $("#last-page").hide();
    $("#next-page").hide();
}

// Set the radius of the stopwatch canvas
// Hard-coded values based on the stopwatch image
var radius = {
    seconds: 108,
    minutes: 30
}

// Draw the resting hands of the stopwatch (straight-up lines)
drawStartingHands();

// Track the start time of the stopwatch
var start = 0;

// Track if the stopwatch is counting
var counting = false;

/**
    Starts the stopwatch.
*/
function begin() {
    // Don't let the user begin if the stopwatch is already going
    if(!counting){
        start = Date.now();
        counting = true;
        // Start drawing the canvas
        draw();
        // Add a row to the history
        // If the user denied location, enter appropriate message
        data.push({start: start, startLoc: (geo ? "" : "Location blocked")});
        updateTotalPages();
        // Try to get the user's location
        setLocation(data.length - 1, false);
        // Update the table
        updateTable();
    }
}

/**
    Stops the stopwatch.
*/
function finish() {
    // Don't let the user stop if the stopwatch isn't going
    if(counting){
        counting = false;
        var last = data[data.length - 1];
        // Remove the most recent row
        data.pop();
        // Update the row with the new data
        data.push({start: last.start, stop: Date.now(), startLoc: last.startLoc, stopLoc: (geo ? "" : "Location blocked")});
        updateTotalPages();
        // Try to get the user's location
        setLocation(data.length - 1, true);
        // Update the table
        updateTable();
    }
}

/**
    Gets the angle associated with a time amount.
    
    @param {number} amount The time amount to convert to an angle
    
    @return {number} The angle associated with the given amount
*/
function timeToAngle(amount) {
    // 6 degrees per time unit
    // Add 90 degrees since 90deg (straight up) is actually 0 seconds
    return (-amount * 6) + 90;
}

/**
    Draws the watch hands at rest.
*/
function drawStartingHands() {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    // Line going straight up
    ctx.lineTo(0, radius.seconds * Math.sin(-90*Math.PI/180));
    ctx.lineWidth = 5;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, -50);
    // Line going straight up
    ctx.lineTo(0, -50 + radius.minutes * Math.sin(-90*Math.PI/180));
    ctx.lineWidth = 3;
    ctx.stroke();
}

/**
    Draws the stopwatch canvas.
*/
function draw() {
    // Clear the previous canvas
    // We have to tranform the context back since we moved it earlier
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.restore();
    
    // Find time units for setting the hands' angles
    var millis = (Date.now() - start);
    var seconds = millis / 1000;
    var minutes = seconds / 60;
    
    // Find the end coords of the seconds hand
    // Using triginometry to find the x- and y- components of the end point
    // Must convert angle to radians to perform trig
    var secs_ang = timeToAngle(seconds);
    var seconds = {
        x: radius.seconds * Math.cos(-secs_ang*Math.PI/180),
        y: radius.seconds * Math.sin(-secs_ang*Math.PI/180)
    };
    
    // Find the end coords of the minutes hand
    var mins_ang = timeToAngle(minutes);
    var minutes = {
        x: radius.minutes * Math.cos(-mins_ang*Math.PI/180),
        y: -50 + radius.minutes * Math.sin(-mins_ang*Math.PI/180)
    };
    
    // Draw the seconds hand
    ctx.beginPath();
    ctx.moveTo(0, 0);
    // Use the previously-found x and y components
    ctx.lineTo(seconds.x, seconds.y);
    ctx.lineWidth = 5;
    ctx.stroke();
    
    // Draw the minutes hand
    ctx.beginPath();
    ctx.moveTo(0, -50);
    ctx.lineTo(minutes.x, minutes.y);
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Set the digital clock as well
    $("#digital").html(getDigitalFormat(millis));
    
    // Continue drawing if timer is still on
    if(counting) {
        window.requestAnimationFrame(draw);
    }
}

/**
    Converts milliseconds to a "digital" reading format.
    
    @param {number} millis The number of milliseconds to convert
    
    @return {string} The digital format representing the milli time amount
*/
function getDigitalFormat(millis) {
    // Converting a date to an ISO string is an easy way to convert millis to a readable format
    var time = new Date(millis).toISOString().substr(11, 8);
    // Track up to a hundredth of a second
    var milli = Math.floor(millis / 10) % 100;
    
    // Return the ISO string plus the hundredth of a second time
    return time + "." + (milli < 10 ? '0' : '') + milli;
}

/**
    Sets the user's location in the row at the index.
    
    @param {number} index The index to set the location of
    @param {boolean} stopping A boolean representing whether or not the watch is stopping
*/
function setLocation(index, stopping) {
    // We have to set the location afterwards because geolocation doesn't return a position immediately
    // Therefore, we track the index and set the value as soon as we get it
    if(geo){
        navigator.geolocation.getCurrentPosition(function(position) {
            if(!stopping){
                data[index].startLoc = position.coords.latitude.toFixed(4) + ", " + position.coords.longitude.toFixed(4);
            }else{
                data[index].stopLoc = position.coords.latitude.toFixed(4) + ", " + position.coords.longitude.toFixed(4);
            }
            updateTable();
        },
        function (error) { 
            if(error.code == error.PERMISSION_DENIED){
                geo = false;
            }
        });
    }
}