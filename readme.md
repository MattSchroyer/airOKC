## What do you think you're doing here?

Let's say you want a neat little dashboard to show how some environmental factors are changing over time in your area. You want this data to come from official environmental monitors. Usually you'd have to set up a fancy server to handle the scraping and storing of data. Are you kidding me with this? Ain't nobody got time for that.

AirOKC makes the server Google's problem. You set up a Google Sheet, with a Google Script in the background that scrapes and sanitizes the official data on a regular basis. You then publish the sheet, meaning all the environmental readings you collected are available by request from anyone, anywhere.

The rest is handled on the front-end. AirOKC uses the ever-nifty Tabletop JavaScript library to read the published Google sheet. That data is then presented in a line chart thanks to the super-flexible d3 JavaScript library.

And that's pretty much it. Anything you can scrape with a Google script, you can now visualize in d3, with minimal back-end infrastructure and minimal front-end development. Essentially, it's a "serverless," all-in-one, scraping-to-visualization solution.

## Tell me more about the scraping.

If you want to use AirOKC for your own project, you're going to have to tweak the Google script first and foremost. The script in this example was specifically developed to scrape a somewhat obscure tab-separated text file published by the Oklahoma Department of Environmental Quality. The script may be a helpful example of how to deal with your own particular data source, but I can suggest a few sites that have more comprehensive info on how to go about scraping with Google scrips:

[Jeremy Duvall's "Automate Google Sheets: An Introduction to Google Apps Script"](https://zapier.com/learn/google-sheets/google-apps-script-tutorial/)

[Google's intro to extending Google Sheets with scripts](https://developers.google.com/apps-script/guides/sheets)

["Oracle of Bacon" tutorial involving parsing an XML document in a Google script](https://developers.google.com/apps-script/articles/XML_tutorial)

[StackOverflow: Access, parse, and write .csv data - google apps script](http://stackoverflow.com/questions/18809593/access-parse-and-write-csv-data-google-apps-script)

## Limitations

AirOKC is perfect in every way. Its mother said so.

### AirOKC's mother is a liar. What are the limitations?

One of the criticisms of Tabletop is that Google has been known to change or entirely remove longstanding functionality without notice and without viable alternatives. There once was a time when you could publish a sheet as a csv page that you could read from the browser, but that is no longer. You can still publish as a csv, but it's no longer a page you can scrape -- you only can download the file. And of course, Tabletop exists exclusively to scrape published Google sheets.

The Google Sheets user community and the Tabletop community have been pretty good about offering each other support and adapting to those changes. But there are no guarantees. If you approach AirOKC as a temporary, low-stakes project to build experience and produce something practical on a small scale, that risk probably is worth the reward. For example, if you're a small to mid-sized newsroom working on a sensor journalism initiative within the scope of a one-year grant, go for it. If you're an educator conveying a lesson about the intersection of IoT and front-end development within the scope of a one-semester course, go for it. If you're trying to build a rock-solid solution for a multi-million company as part of a years-long initiative, you should look elsewhere.

The other obvious limitation is storage space. As of August 2016, you can store up to 2 million cells in a Google sheet. Assuming every row has one cell for a date stamp and one cell for an environmental variable, and data is logged on an hourly basis, a single sheet could hold 114 years of data. Increase the logging frequency to once every minute, and the time window shrinks to 1.9 years.

Of course, you always could spread a project across multiple sheets. As of August 2016, sheets do not count against the 15 GB limit for free storage on Google Drive.

## What else can AirOKC do for me?

Throw out the script behind the sheets, modify the parsing behavior in the JavaScript, and have a WiFi-connected sensor send data directly to the sheet instead. You now have a customizable dashboard for home monitoring or sensor journalism.

Throw out the script, import a dataset manually from somewhere else, and modify the parsing behavior in the JavaScript. You now have a quick d3 chart for any time series data you can throw in a sheet.

You may also note that AirOKC creates horizontal reference lines that only appear when datapoints approach the reference value(s). They transition along with the rest of the chart when the time interval changes. Feel free to steal those.

## My chart is behaving unexpectedly! What gives?

### The line on my chart just... ends.

Probably there is data in your Google Sheet that either Tabletop or d3 simply do not like. For example, you may have unintentionally scraped letters along with your numbers. In the event that one of your cells has unintelligible data, the line will usually just stop at the last readable datapoint, and will ignore any data after that point.

Go into your sheet, and find and correct the problem cell(s). You may also have to introduce more data sanitization in your script to prevent problem cells from being written in the first place.

### My chart is supposed to show just one day of data, but it's showing more than that. And not all of the data points are there.

Tabletop has a very handy feature -- it can query just a portion of your sheet. That's convenient if you only want the last 24 hours of data, when the table has gathered thousands of hours of data. But it will only work if Google Sheets handles the query correctly. One strange behavior I've observed is that if formatting is slightly different in some rows on sheets, the results from the query may be off.

For example, I once had Tabletop query a sheet for 24 hours of data. Instead of getting 24 hours of data, I got four days of data. Except data for the two middle days were missing, despite those rows clearly existing in the sheet. It turned out I had manually entered data for several rows, and those rows had slightly different cell formatting than other cells. Re-formatting those cells didn't solve the problem, but deleting those entire rows resulted in a successful query.

In short, don't manually enter data if you can avoid it. When the script enters data, they may be formatted differently than if you were to enter the same data manually. Deleting some problem rows may solve your issue.

### Other

Use the developer console, Luke. Any time the chart in AirOKC is loaded, the console will print the array of datapoints. Study those datapoints. Compare the array to your Google sheet. Usually if there is an issue, it's due to the formatting or content of the underlying sheet.