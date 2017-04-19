// Generate file in http://www.bcb.gov.br/htms/selic/selicdiarios.asp

(function(){
  // var detectCharacterEncoding = require('detect-character-encoding');
  //
  // var fileBuffer = fs.readFileSync(process.argv[2]);
  // var charsetMatch = detectCharacterEncoding(fileBuffer);
  //
  // console.log(charsetMatch);
  //
  var fs                = require('fs');
  var config            = require('./config.json');
  var LineByLineReader  = require('line-by-line');
  var removeDiacritics  = require('diacritics').remove;
  var plotly            = require('plotly')(config.plotly.username, config.plotly.apiKey);
  var moment            = require('moment');
  var config            = require('./config.json');

  var _array = [];
  var _header = [];

  if (!process.argv[2]) {
    console.error("invalid path");
  } else {
    var _path       = process.argv[2];
    var _lineReader = new LineByLineReader(_path, {
      encoding: 'ascii',
      skipEmptyLines : true
    });

    _lineReader.on('error', function(e) {
      console.error("Error read path "+ _path +" ==>> "+ JSON.stringify(e));
    });

    _lineReader.on('end', function () {
      // console.log("array ==>> "+ JSON.stringify(_array));
      var _x = [];
      var _y = [];

      _array.forEach(function(_val) {
        _x.push(_val.date);
        _y.push(_val.value);
      });

      var dataGraph = [
        {
          x: _x,
          y: _y,
          type: "scatter"
        }
      ];


      // Generate online
      var graphOptions = {filename: "taxa-selic-diaria", fileopt: "overwrite"};
      plotly.plot(dataGraph, graphOptions, function (err, msg) {
        console.log(msg);
      });


      // Generate Image
      // var figure = { 'data': [dataGraph] };
      //
      // var imgOpts = {
      //     format: 'png',
      //     width: 1000,
      //     height: 500
      // };
      //
      // plotly.getImage(figure, imgOpts, function (error, imageStream) {
      //   if (error) return console.log (error);
      //
      //   var fileStream = fs.createWriteStream("./taxa-selic-"+ moment().format('DD-MM-YYYY-HH:mm:ss')+ ".png");
      //   imageStream.pipe(fileStream);
      // });
    });

    _lineReader.on('line', function(line) {
      if (line.indexOf("Lista de indices Diarios da TaxaSelic") >= 0) {

      } else if (line.indexOf('Data') === 0) { // Header
        _header = line.split(';').map(function(h) {
          return removeDiacritics(h);
        });
        // console.log("header ==>> "+ JSON.stringify(_header));
      } else if (line.length <= 0) { // Empty Lines

      } else {
        var _values = line.split(';');
        var _obj = {
          date : _values[0],
          value : parseFloat(_values[1].replace(',','.'))
        };

        // console.log("_obj ==>> "+ JSON.stringify(_obj));

        _array.push(_obj);
        // console.log("array length "+ _array.length);
      }
    });
  }
})();
