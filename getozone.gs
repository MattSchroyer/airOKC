function get_csv() { 
  var url = 'http://www.deq.state.ok.us/aqdnew/monitoring/data/SITE0033.txt'; // URL of the file to scrape
  var response = UrlFetchApp.fetch(url);
  Logger.log( "RESPONSE " + response.getResponseCode()); 
  var data = response.getContentText().toString();
  Logger.log( "DATA " + data);
  return data
}

function importFromCSV() {
  // Function is triggered every hour
  // Handles the difficult job of parsing the text table given from ODEQ
  // Will vary greatly, depending on the data your individual project is using
  
  var rawData = get_csv();

  var csvData = CSVToArray(rawData, "\t"); // turn into an array
  Logger.log("CSV ITEMS " + csvData.length);
  
  // Gets the active spreadsheet
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();

  Logger.log("HERE IS MY DATE: " + csvData[37][5]);
  
  Logger.log("IS BLANK O3 DATA: " + csvData[52][1]);
  
  if (csvData[52][1] == "          ") {
    Logger.log("It is blank!")
  };
  
  // isPosted indicates whether this datapoint has been recorded before in the sheet
  var isPosted = false;
  
  // Rows 5-28 are previous day's numbers
  // Rows 40-63 are current day's numbers
  // So we begin searching at row 40 for new datapoint
  for (var i = 40; i < csvData.length; i++) {
    // If we haven't posted already...
    if (isPosted == false) {
      // If there is a series of spaces in the cell for O3 reading, then you've reached end of the data
      if (csvData[i][1] == "          ") {
        Logger.log("i is:" + i);
        // If that blank cell is not the first cell in the current day's numbers...
        if (i > 40) {
          // ... then the data point is one row above where the blank cell was found
          var newData = [csvData[37][5],csvData[i-1][0],csvData[i-1][1],csvData[i-1][2],csvData[i-1][3],csvData[i-1][4]];
        }
        else {
          // Otherwise, the data is in previous day's numbers
          for (var j = 27; j < 30; j++) {
            if (csvData[j][1] == "          ") {
              var newData = [csvData[2][5],csvData[j-1][0],csvData[j-1][1],csvData[j-1][2],csvData[j-1][3],csvData[j-1][4]];
            }
            if (csvData[28][1] != "          ") {
              var newData = [csvData[2][5],csvData[28][0],csvData[28][1],csvData[28][2],csvData[28][3],csvData[28][4]];
            }
          }
        }
        
        var timeString = newData[1].toString();
        Logger.log("timeString before: " + timeString);
        
        // var spaceIndex = timeString.indexOf(" ");
        // var timeString = timeString.substring(0, spaceIndex);
        
        var timeString = timeString.substring(0, 5);
        newData[1] = timeString;
        Logger.log("timeString after: " + timeString);
        var myLastRow = SpreadsheetApp.getActiveSheet().getLastRow();
        var myLastTime = SpreadsheetApp.getActiveSheet().getRange(myLastRow,2).setNumberFormat('@STRING@');
        var myLastTime = SpreadsheetApp.getActiveSheet().getRange(myLastRow,2).getValue();
        if (timeString != myLastTime) {
          Logger.log(timeString + " != " + myLastTime + ", so appending");
          sheet.appendRow(newData);
          var myLastRow = SpreadsheetApp.getActiveSheet().getLastRow();
          SpreadsheetApp.getActiveSheet().getRange(myLastRow,2).setNumberFormat('@STRING@');
        }
        else {
          Logger.log(timeString + " == " + myLastTime + ", so not appending");
        }
        isPosted = true;
        Logger.log("BLANK FOUND")
      }
    }
  }
  
}

function CSVToArray( strData, strDelimiter ){
  // Check to see if the delimiter is defined. If not,
  // then default to comma.
  strDelimiter = (strDelimiter || ",");
  
  // Create a regular expression to parse the CSV values.
  var objPattern = new RegExp(
    (
      // Delimiters.
      "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
      
      // Quoted fields.
      "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
      
      // Standard fields.
      "([^\"\\" + strDelimiter + "\\r\\n]*))"
    ),
    "gi"
  );
  
  
  // Create an array to hold our data. Give the array
  // a default empty first row.
  var arrData = [[]];
  
  // Create an array to hold our individual pattern
  // matching groups.
  var arrMatches = null;
  
  // Keep looping over the regular expression matches
  // until we can no longer find a match.
  while (arrMatches = objPattern.exec( strData )){
    
    // Get the delimiter that was found.
    var strMatchedDelimiter = arrMatches[ 1 ];
    
    // Check to see if the given delimiter has a length
    // (is not the start of string) and if it matches
    // field delimiter. If id does not, then we know
    // that this delimiter is a row delimiter.
    if (
      strMatchedDelimiter.length &&
      (strMatchedDelimiter != strDelimiter)
      ){
        
        // Since we have reached a new row of data,
        // add an empty row to our data array.
        arrData.push( [] );
        
      }
    
    
    // Now that we have our delimiter out of the way,
    // let's check to see which kind of value we
    // captured (quoted or unquoted).
    if (arrMatches[ 2 ]){
      
      // We found a quoted value. When we capture
      // this value, unescape any double quotes.
      var strMatchedValue = arrMatches[ 2 ].replace(
        new RegExp( "\"\"", "g" ),
        "\""
      );
      
    } else {
      
      // We found a non-quoted value.
      var strMatchedValue = arrMatches[ 3 ];
      
    }
    
    
    // Now that we have our value string, let's add
    // it to the data array.
    arrData[ arrData.length - 1 ].push( strMatchedValue );
  }
  
  // Return the parsed data.
  return( arrData );
}