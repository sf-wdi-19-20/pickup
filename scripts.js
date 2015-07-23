$(function() {
  // CHECK IF WE"RE CONNECTED
  console.log('I\'m here to serve')

  // var baseUrl = "http://localhost:3000" // DEV
  // var baseUrl = "https://pickup-wdi.herokuapp.com" // PRD

  // don't need a base url for now, we'll just blank it
  // it defaults to whichever of the above is correct
  var baseUrl = "";  

  // compile line template function (calling it $line)
  $line = _.template( $("#lineTemplate").html() )

  $.get(baseUrl + '/api/lines', function(data) {
    var lines = data  

    _.each(lines, function(line) {
      //console.log(line)
      $('#lines').append($line(line))
    })
  })

  $('#new-line').submit(function(e){
    e.preventDefault();
    // console.log("im submitting a form")
    var line = {
      text: $('#line-text').val()
    }
    $.post('/api/lines', line, function(data) {
      console.log(data)
      $('#lines').prepend($line(data))
    })

  });

  // @AUTH
  // submit event listener for login form
  $('#login-form').on("submit", function(event){
    // don't forget to event.preventDefault()
    event.preventDefault();
    // get data out of form
    var userData = {
      email: $("#login-user-email").val(),
      password: $("#login-user-password").val()
    };
    // send login request with form data
    $.post('/login', userData, function(response){
      // console.log("got log in response ", response);
      // once server responds, update logged in message 
      updateViewForCurrentUser();
    });
  });

  // @AUTH @NEW
  // for efficiency, let's go ahead and set up jQuery variables
  // for selecting dom elements we'll want to use over and over
  var $loggedInMessage = $("#loggedInMessage");
  var $logoutButton = $("#logout-btn");

  // @AUTH
  // update the logged in message on the page
  // This function is called after login and when the page loads.   
  // Would be called after signup too if we were using jQuery to submit signup form. 
  function updateViewForCurrentUser(){
    // request current user info from server
    $.get('/currentuser', function(response){
        // server responds with the current user
        console.log("server says current user is: ", response);
        if (response === null){
          // no one is logged in
          $loggedInMessage.html("You're definitely not logged in.");
          // make sure the logout button is hidden
          $logoutButton.hide();
        } else {
          // someone is logged in
          $loggedInMessage.html("You're definitely logged in as " + response.email + ".");
          // show the logout button
          $logoutButton.show();
        }
      }
    );
  }

  // @AUTH
  // check current user on page load to update logged in message
  updateViewForCurrentUser();


});




