$(function() {
  // CHECK IF WE"RE CONNECTED
  console.log('I\'m here to serve')

  // var baseUrl = "http://localhost:3000" // DEV
  var baseUrl = "https://mighty-journey-5450.herokuapp.com" // PRD
  // DEFINE LINES
  
  $line = _.template( $("#lineTemplate").html() )

  $.get(baseUrl + '/api/lines', function(data) {
    var lines = data  

    _.each(lines, function(line) {
      console.log(line)
      $('#lines').append($line(line))
    })
  })

  $('#new-line').submit(function(e){
    e.preventDefault();
    console.log("im submitting a form")
    var line = {
      text: $('#line-text').val()
    }
    $.post('/api/lines', line, function(data) {
      console.log(data)
      $('#lines').prepend($line(data))
    })

  })
})




