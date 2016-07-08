function get_csv() { 
  var url = 'http://www.deq.state.ok.us/aqdnew/monitoring/data/SITE0033.txt'; // Change this to the URL of your file
  var response = UrlFetchApp.fetch(url);
  // If there's an error in the response code, maybe tell someone
  //MailApp.sendEmail("s.brown@york.ac.uk", "Error with CSV grabber:" + response.getResponseCode() , "Text of message goes here")
  Logger.log( "RESPONSE " + response.getResponseCode()); 
  var data = response.getContentText().toString();
  Logger.log( "DATA " + data);
  return data //as text
}

function importFromCSV() {
  // This is the function to which you attach a trigger to run every hour  
  var rawData = get_csv(); // gets the data, makes it nice...
  
  var csvData = CSVToArray(rawData, "\t"); // turn into an array
  Logger.log("CSV ITEMS " + csvData.length);
  
  //Write data to first sheet in this spreadsheet
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();

  Logger.log("HERE IS MY DATE: " + csvData[37][5]);
  
  Logger.log("IS BLANK O3 DATA: " + csvData[52][1]);
  
  if (csvData[52][1] == "          ") {
    Logger.log("It is blank!")
  };
  
  var isPosted = false;
  // rows 5-28 are previous day's numbers
  //rows 40-63 are current day's numbers
  for (var i = 40; i < csvData.length; i++) {
    if (isPosted == false) {
      if (csvData[i][1] == "          ") {
        Logger.log("i is:" + i);
        if (i > 40) {
          var newData = [csvData[37][5],csvData[i-1][0],csvData[i-1][1],csvData[i-1][2],csvData[i-1][3],csvData[i-1][4]];
        }
        else {
          for (var j = 27; j < 30; j++) {
            if (csvData[j][1] == "          ") {
              var newData = [csvData[2][5],csvData[j-1][0],csvData[j-1][1],csvData[j-1][2],csvData[j-1][3],csvData[j-1][4]];
            }
            if (csvData[28][1] != "          ") {
              var newData = [csvData[2][5],csvData[28][0],csvData[28][1],csvData[28][2],csvData[28][3],csvData[28][4]];
            }
          }
        }
        //sheet.appendRow(csvData[i-1]);
        //Logger.log("Last row = " + sheet.getLastRow());
        //Logger.log("Last col = " + sheet.getRange(sheet.getLastRow(),2));
        //var myValue = sheet.getRange(sheet.getLastRow(),2).getValue();
        //Logger.log(myValue);
        //Logger.log(csvData[i-1][0]);
        var timeString = newData[1].toString();
        Logger.log("timeString before: " + timeString);
        var spaceIndex = timeString.indexOf(" ");
        var timeString = timeString.substring(0, spaceIndex);
        Logger.log("timeString after: " + timeString);
        Logger.log("spaceIndex in timeString: " + spaceIndex);
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
  
  /*
  for (var i = 0; i < csvData.length; i++) {
    sheet.getRange(i+1, 1, 1, csvData[i].length).setValues(new Array(csvData[i]));
     //this might be where you would look at the data and maybe...
    // cell.offset(i,i+2).setBackgroundColor("green"); 
    //Logger.log( "i:" + i + " " + csvData[i] );
  }
  */
  
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