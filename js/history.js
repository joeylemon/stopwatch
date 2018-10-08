/*
Author: Joey Lemon
Date: Oct. 7, 2018

Written for ClickTime's software development coding exercise
*/



var page_settings = {
    rows_per_page: 10
};
var page = 1;

/**
    Updates the user's history table.
*/
function updateTable() {
    // Show the table buttons
    $("#reset").show();
    $("#last-page").show();
    $("#next-page").show();
    
    // Clear the previous data
    $("#data").html("");
    
    // Set the table headers
    $("#data").append(`
        <tr>
            <th>Start</th>
            <th>Start Location</th>
            <th>Stop</th>
            <th>Stop Location</th>
            <th>Elapsed</th>
        </tr>
    `);
    
    // Only show the current page's contents
    var array = paginate(data.slice().reverse(), page_settings.rows_per_page, page);
    
    // Add the rows from the array to the table
    for(var i = 0; i < array.length; i++){
        var row = array[i];
        // If the row has a stop value, then we know it's a full row
        if(row.stop){
            $("#data").append(`
                <tr>
                    <td>` + new Date(row.start).toLocaleString() + `</td>
                    <td><a href="https://www.google.com/maps/search/` + row.startLoc + `" target="_blank">` + row.startLoc + `</a></td>
                    <td>` + new Date(row.stop).toLocaleString() + `</td>
                    <td><a href="https://www.google.com/maps/search/` + row.stopLoc + `" target="_blank">` + row.stopLoc + `</a></td>
                    <td>` + getDigitalFormat((row.stop + 10) - row.start) + `</td>
                </tr>
            `);
        }else{
            // If the row is still in progress, only add known information
            $("#data").append(`
                <tr>
                    <td>` + new Date(row.start).toLocaleString() + `</td>
                    <td><a href="https://www.google.com/maps/search/` + row.startLoc + `" target="_blank">` + row.startLoc + `</a></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            `);
        }
    }
    
    // Add the history array to local storage
    localStorage.setItem("history", JSON.stringify(data));
}

/**
    Resets the user's history.
*/
function reset() {
    // Clear the current array
    data = new Array();
    
    // Remove the data from local storage
    localStorage.removeItem("history");
    
    // Hide the table
    $("#data").html("");
    $("#reset").hide();
    $("#last-page").hide();
    $("#next-page").hide();
    
    // Go back to page 1
    page = 1;
}

/**
    Gets a subsection of an array to follow a page scheme.
    
    @param {Array} array The array to paginate
    @param {number} page_size The size of each page
    @param {number} page_number The page to display
    
    @return {Array} The paginated array
*/
function paginate(array, page_size, page_number) {
    // Decrease page number since pages start at 1 but arrays start at 0
    --page_number;
    
    // Slice the array to only return the current page's contents
    return array.slice(page_number * page_size, (page_number + 1) * page_size);
}

/**
    Attempts to move the table to the last page.
*/
function lastPage() {
    // Ensure it's possible
    if(page > 1){
        page--;
        // Update buttons so invalid ones aren't shown
        updatePageChangeButtons();
        // Update the table
        updateTable();
    }
}

/**
    Attempts to move the table to the next page.
*/
function nextPage() {
    // Ensure it's possible
    if(page < total_pages){
        page++;
        // Update buttons so invalid ones aren't shown
        updatePageChangeButtons();
        // Update the table
        updateTable();
    }
}

/**
    Updates the table's action buttons, showing only valid ones.
*/
function updatePageChangeButtons() {
    // Show the last page button if it's valid, hide if not
    if(page <= 1){
        $("#last-page").css({opacity: "0", cursor: "default"});
    }else{
        $("#last-page").css({opacity: "1", cursor: "pointer"});
    }
    // Set the last page number
    $("#last").html(page - 1);
    
    // Show the next page button if it's valid, hide if not
    if(page >= total_pages){
        $("#next-page").css({opacity: "0", cursor: "default"});
    }else{
        $("#next-page").css({opacity: "1", cursor: "pointer"});
    }
    // Set the next page number
    $("#next").html(page + 1);
}

/**
    Updates the total page count and the table's action buttons
*/
function updateTotalPages() {
    // Update the total page count
    total_pages = Math.ceil(data.length / page_settings.rows_per_page);
    // Update the page buttons in case there is a change
    updatePageChangeButtons();
}