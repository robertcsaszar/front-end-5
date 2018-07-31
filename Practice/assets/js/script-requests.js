$(domLoaded)

function domLoaded(){
  console.log("Dom loaded")
  
  var apiUrl = "https://jsonplaceholder.typicode.com/posts/";
  var btn = $("#createPost");
  
  btn.on("click", createPost);
  
  // Get all titles //
//   function displayTitles() {
//     var titleContainer = $("#titleContainer");
//     $.ajax ({
//       url: apiUrl,
//       success: function(response) {
//         for(var i = 0; i < response.length; i++) {
//           var title = "<h4>Title: " + response[i].title + "</h4>"
//           titleContainer.append(title)
//         }
//       }
//     })
//   }
  
  // Get a specific title by id //
//   function displayTitle() {
//     var id  = $("[name=titles]").val();
//     var titleContainer = $("#titleContainer");
//     $.ajax({
//       url: apiUrl + id,
//       success: function(response) {
//         var title = "<h3>Title: " + response.title + "</h3>";
//         titleContainer.append(title);
//       }
//     })
//   }
  
  // Request to DELETE a post //
//   function deleteTitle() {
//     var id = $("[name=titles]").val();
//     var titleContainer = $("#titleContainer");
//     $.ajax({
//       url: apiUrl + id,
//       method: "DELETE",
//       success: function(response) {
//         var deletedTitle = "<h4>" + "Post "+ id + " deleted successfully" + "</h4>";
//         titleContainer.append(deletedTitle);
//       }
//     })
//   }
  
  // Request to UPDATE a post //
//   function updatePost() {
//     var id = $("[name=titleID]").val();
//     var title = $("[name=title]").val();
//     var bodyText = $("[name=textarea]").val();
//     var userID = Math.floor(Math.random() * 2);
//     var updateConfirmation = $("#titleContainer");
//     $.ajax ({
//       url: apiUrl + id,
//       method: "PUT",
//       data: {
//         title: title,
//         body: bodyText,
//         userId: userID
//       },
//       success: function(response){
//         var update = "<h4>" + "Post " + id + " updated successfully" + "</h4>"
//         updateConfirmation.append(update)
//         console.log("Post successfully updated " , response);
//         console.log("Post successfully updated " , response.id);
//       }
//     })
//   }
  
  // Request to CREATE a post //
//   function createPost() {
//     var title = $("[name=createTitle]").val();
//     var bodyText = $("[name=createTextarea]").val();
//     var userID = Math.floor(Math.random() * 2);
//     var updateConfirmation = $("#titleContainer");
//     $.ajax ({
//       url: apiUrl,
//       method: "POST",
//       data: {
//         title: title,
//         body: bodyText,
//         userId: userID
//       },
//       success: function(response){
//         var create = "<h4>Post created successfully!</h4>"
//         updateConfirmation.append(create)
//         console.log("Post successfully updated " , response);
//         console.log("Post successfully updated " , response.id);
//       }
//     })
//   }
  
 
}


