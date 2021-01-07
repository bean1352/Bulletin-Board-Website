//front-end sanitization and front-end logic
// (function ($) {
//     "use strict";


    // /*==================================================================
    // [ Focus input ]*/

    // $('.input100').each(function () {
    //     $(this).on('blur', function () {
    //         if ($(this).val().trim() != "") {
    //             $(this).addClass('has-val');
    //         }
    //         else {
    //             $(this).removeClass('has-val');
    //         }
    //     })
    // })



    // //check if form inputs are valid on submit
    // var input = $('.validate-input .input100');

    // $('.validate-form').on('submit', function () {
    //     var check = true;

    //     for (var i = 0; i < input.length; i++) {
    //         if (validate(input[i]) == false) {
    //             showValidate(input[i]);
    //             check = false;
    //         }
    //     }

    //     return check;
    // });

    // //If input field focused then remove validation styling
    // $('.validate-form .input100').each(function () {
    //     $(this).focus(function () {
    //         hideValidate(this);
    //     });
    // });

    // //if input is email then use email verification else use generic trim
    // function validate(input) {
    //     if ($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
    //         if ($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
    //             return false;
    //         }
    //     }
    //     else {
    //         if ($(input).val().trim() == '') {
    //             return false;
    //         }
    //         if ($(input).attr('type') == 'password' && $(input).parent().attr('action') == '/register') {
     
    //             if ($(input).val().trim().match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/) == null) {
    //                 flash1('Minimum eight characters, at least one letter and one number for password')
    //                 return false;
    //             }


    //         }
    //         if ($(input).attr('type') == 'tel') {
    //             if ($(input).val().trim().match(/^[0-9]{10}$/) == null) {
    //                 flash1('Phone number must be 10 digits long')
    //                 return false;
    //             }
    //         }


    //     }
    // }

    // //displays validation errors via the alert-validate class
    // function showValidate(input) {
    //     var thisAlert = $(input).parent();

    //     $(thisAlert).addClass('alert-validate');
    // }

    // //hides validation errors via the alert-validate class
    // function hideValidate(input) {
    //     var thisAlert = $(input).parent();

    //     $(thisAlert).removeClass('alert-validate');
    // }

    // /*==================================================================
    // [ Show pass ]*/

    // //show password text to user
    // var showPass = 0;
    // $('.btn-show-pass').on('click', function () {
    //     if (showPass == 0) {
    //         $(this).next('input').attr('type', 'text');
    //         $(this).addClass('active');
    //         showPass = 1;
    //     }
    //     else {
    //         $(this).next('input').attr('type', 'password');
    //         $(this).removeClass('active');
    //         showPass = 0;
    //     }

    // });

    // post.addEventListener("submit", e => {
    //     e.preventDefault();


    //     let post = document.querySelector('.post')






    // })
    

    var post = document.getElementById('new-post')

    let createNewPost = (data) => {
        let postContainer = document.querySelector('.posts')


        let newPost = `
         <div class="post">
         <input type="hidden" name="postID" value="${data._id}" >
         <div class="post-content">
            <h4 class='post-content'>${data.content} </h4> 
            <button class='buttonall'><a class='remove-post' href='/removePost'> Delete</a></button>
            
        </div>
        <h6 class="userDetail">${data.email} -  ${data.dateAdded} </h6>
        <hr>
</div>`

        postContainer.innerHTML += newPost;

        let posts = postContainer.querySelectorAll('.post')
        Array.from(posts).forEach(post => deleteListen(post))

    }


    //await submit event then use asynchonus call to backend and retrieve post data 

    post.addEventListener('submit', (e) => {
        e.preventDefault();

        let content = document.getElementById('content').value;

        //let token = post.querySelector('input[name="_csrf"]').value

        let xhr = new XMLHttpRequest();

        xhr.open('POST', 'https://localhost:3001/post');
        // xhr.setRequestHeader('CSRF-Token', token)

        xhr.withCredentials = true;

        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.send(JSON.stringify({ content: content }));

        xhr.setC


        xhr.onload = function () {
            if (xhr.status != 200) { // analyze HTTP status of the response
                alert(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
            } else { // show the result

                //load data via dom insertion
                createNewPost(JSON.parse(xhr.response));
                //flash('Post added.');

                updateScroll();
            }
        };


        xhr.onerror = function () {
            alert("Request failed");
        };

    })

    //await submit event then use asynchonus delete call to backend with id of post

    function deleteListen(post) {
        var deleteBtn = post.querySelector('.remove-post')
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();

   
                let id = post.querySelector('input[name="postID"]').value;

                

                let xhr = new XMLHttpRequest();

                xhr.open('POST', 'https://localhost:3001/removePost');

                xhr.setRequestHeader("Content-Type", "application/json");
                

                

                xhr.send(JSON.stringify({ id: id }));


                xhr.onload = function () {
                    if (xhr.status != 200) { // analyze HTTP status of the response
                        alert(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
                    } else { // show the result
                        post.remove()
                        
                        updateScroll();
                    }
                };


                xhr.onerror = function () {
                    alert("Request failed");
                };

            })
        }
    }


    let posts = document.querySelectorAll('.post')


    Array.from(posts).forEach((post) => {

        deleteListen(post);
        saveListen(post);

    })


    function saveListen(post) {
        var saveBtn = post.querySelector('.save-post')
        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();

                let id = post.querySelector('input[name="postID"]').value;

                let token = post.querySelector('input[name="_csrf"]').value

                let xhr = new XMLHttpRequest();

                xhr.open('POST', 'https://localhost:3000/savePost');

                xhr.withCredentials = true;

                xhr.setRequestHeader("Content-Type", "application/json");

                xhr.setRequestHeader('CSRF-Token', token)

                xhr.send(JSON.stringify({ id: id }));


                xhr.onload = function () {
                    if (xhr.status != 200) { // analyze HTTP status of the response
                        alert(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
                    } else { // show the result

                        flash('Post Saved.');
                        updateScroll();
                    }
                };


                xhr.onerror = function () {
                    alert("Request failed");
                };

            })
        }
    }

    function flash(msg) {

        let flashMsg = document.createElement('div')

        flashMsg.classList.add('alert', 'alert-success', 'alert-dismissible', 'show')
        flashMsg.style.position = 'fixed'
        flashMsg.style.zIndex = '123'
        flashMsg.style.top = '90px'
        flashMsg.innerHTML += `${msg}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>`
        document.querySelector('body').appendChild(flashMsg)
    }

    function flash1(msg) {

        let flashMsg = document.createElement('div')

        flashMsg.classList.add('alert', 'alert-danger', 'alert-dismissible', 'show')
        flashMsg.style.position = 'fixed'
        flashMsg.style.zIndex = '123'
        flashMsg.style.top = '90px'
        flashMsg.innerHTML += `${msg}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>`
        document.querySelector('body').appendChild(flashMsg)
    }

    function updateScroll() {
        var postsContainer = document.querySelector('.posts');
        postsContainer.scrollTop = postsContainer.scrollHeight;
        // postsContainer.scrollTo(0,0);
        let content = document.getElementById('content');

        content.value = '';

    }


    updateScroll();


    let contacts = document.querySelectorAll('.contact');

    for (let index = 0; index < contacts.length; index++) {
        contacts[index].querySelector('.btn-modal').addEventListener('click', function() {
            contacts[index].querySelector('.overlay').classList.add('is-visible');
            contacts[index].querySelector('.modal').classList.add('is-visible');
          });
          
          contacts[index].querySelector('.close-btn').addEventListener('click', function() {
            contacts[index].querySelector('.overlay').classList.remove('is-visible');
            contacts[index].querySelector('.modal').classList.remove('is-visible');
          });
          contacts[index].querySelector('.overlay').addEventListener('click', function() {
            contacts[index].querySelector('.overlay').classList.remove('is-visible');
            contacts[index].querySelector('.modal').classList.remove('is-visible');
          });
        
    }


      




// })(jQuery);