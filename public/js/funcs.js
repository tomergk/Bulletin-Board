// Function to send a POST request with user's entered data
async function sendPostRequest(data) {
    let title = { titleName: data };
    try {
        await fetch("/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(title)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok.");
                }
                return response.json();
            })
            .then(responseData => {
                console.log('Response from server: ', responseData);

                
                displayDropdown(responseData.posts);
            })
    }
    catch (error) {
        console.error("Error sending the POST request:", error);
    }
}


///////////////===================///////////////


/* Fetch the data from the server of posts that matches 
what the user searched for. */

function displayDropdown(posts) {
    const dropdownList = document.getElementById("dropdownList");
    dropdownList.innerHTML = ""; // Clear previous dropdown items

    if (posts.length === 0) {
        dropdownList.style.display = "none"; // Hide the dropdown if no matching posts
    } else {
        dropdownList.style.display = "block"; // Show the dropdown if there are matching posts

        // Create and add dropdown items for each matching post
        posts.forEach((post) => {
            const dropdownItem = document.createElement("li");
            dropdownItem.innerHTML = `
          <a href="/posts/${post._id}">
            <strong>${post.title}</strong>
            <br>
            <small>by ${post.author}</small>
          </a>
        `;
            dropdownList.appendChild(dropdownItem);
        });
    }
}


///////////////===================///////////////

// Sending the current value from seach bar. 
let reqPostTitle = document.getElementById("postTitleInput");
reqPostTitle.addEventListener("input", () => {
    sendPostRequest(reqPostTitle.value);
});

///////////////===================///////////////


// This functionallity take cares of the find post visabillity when clocking on the magnifaying button.
$(document).ready(function () {
    // Getting references to the elements
    const findPostLi = $(".findPostLi");
    const toggleFindPost = $("#toggleFindPost"); // The mag button

    // Function to show/hide the elements when the image is clicked
    toggleFindPost.click(function () {
        findPostLi.fadeToggle("slow");
    });

    // Function to hide the find post element when clicking outside.
    $(document).click(function (event) {
        if (!findPostLi.is(event.target) && !toggleFindPost.is(event.target) && findPostLi.has(event.target).length === 0) {
            findPostLi.fadeOut("slow");
        }
    });
});

