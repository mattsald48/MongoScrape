
$(document).on("click", "a#leavenote", function() {
  console.log('clicking this li');

  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");
  console.log("thisId: "+thisId);
  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {

      // The title of the article
      $("#notes").append(
        
        `<h2>${data.title}</h2>
        <input id='titleinput' name='title'><br>
        <textarea id='bodyinput' name='body'></textarea>
        <a class="btn btn-danger" data-id='${data._id}' href="#" id='savenote'><i class="swg swg-reball swg-lg" aria-hidden="true"></i>Save Comment</a>`
        );

      // If there's a note in the article
      if (data.note) {
       for(var i = 0; i < data.note.length; i++) {
        $("#notes").append(
        `<div class="col-sm-6 col-md-6 col-lg-6" id="notes">
           <br><h6>Title: ${data.note[i].title}</h6>
           <h6>Body:</h6>
           <p>${data.note[i].body}</p>
        </div>`);
       }//end of for loop
      }//end of if
    });//end of done
});//end of .on

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
