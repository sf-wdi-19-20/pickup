$(function() {
  // CHECK IF WE"RE CONNECTED
  console.log('I\'m here to serve')

  var baseUrl = "http://localhost:3000"
  // DEFINE LINES
  
  $line = _.template( $("#lineTemplate").html() )

  $.get(baseUrl + '/api/lines', function(data) {
    var lines = data  

    _.each(lines, function(line) {
      console.log(line)
      $('#lines').append($line(line))
    })
  })
})