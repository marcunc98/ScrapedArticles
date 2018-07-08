// Still need Ajax calls to get the submit  and save articles buttons to function correctly.

// Still needs a modal box for comments 

// Still needs code to attach comments to a specific article.

// Still needs styling

console.log("JS LOADED!!!!!!!");
// $.getJSON("/scrape", function(data) {
//   for (var i = 0; i < data.length; i++) {
// console.log("This is the data:" + data);
//     $("#article").append("<p data-id='" + data[i]._id + "'>" + data[i].headline + "<br />" + data[i].link + "<br />" +data[i].summary + "</p>");
//   }
// })



$("#scrape").on("click", function() {
  console.log("BUTTON CLICKED!");
  $.get("/scrape", function(data) {
    console.log("GET FINISHED");
  });
});

// // // Whenever someone clicks a p tag
// $(document).on("click", "#scrape", function() {
//   // Save the id from the p tag
//   // var thisId = $(this).attr("data-id");

//   // Now make an ajax call for the Article
//   $.ajax({
//     method: "GET",
//     url: "/articles"
//   });
// });

$("#clear").on("click", function() {
  $("#article").empty();
});
