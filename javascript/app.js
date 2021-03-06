  var API_URL = 'http://api.sudodoki.name:8888';

  function login(){
    var login = $('#login_form input[name="login"]').val();
    var pwd = $('#login_form input[name="password"]').val();
    $.ajax({
      url: API_URL + '/login',
      type: 'POST',
      dataType : "json",
      beforeSend: function(){
        cleanupError($('#login_form'));
      },
      data: {
        login: login,
        password: pwd,
      }
    }).done(function( data, textStatus, jqXHR ) {
      sessionStorage.setItem("token", data.token);
      Path.goTo('users');
    }).fail(function( jqXHR, textStatus, errorThrown ) {
      console.log(jqXHR);
      showFormErrors(jqXHR, $('#login_form' ));
    });
  }

  function signup(){
    var login = $('#signup_form input[name="login"]').val();
    var email = $('#signup_form input[name="email"]').val();
    var pwd = $('#signup_form input[name="password"]').val();
    var pwdConfirm = $('#signup_form input[name="passwordConfirmation"]').val();
    $.ajax({
      url: API_URL + '/signup',
      type: 'POST',
      beforeSend: function(){
        cleanupError($('#signup_form'));
      },
      dataType : "json",
      data: {
        login: login,
        password: pwd,
        passwordConfirmation: pwdConfirm,
        email: email
      }
    }).done(function( data, textStatus, jqXHR ) {
      sessionStorage.setItem("token", data.token);
      Path.goTo('users');
    }).fail(function( jqXHR, textStatus, errorThrown ) {
      console.log(jqXHR);
      showFormErrors(jqXHR, $('#signup_form'));
    });
  }

  function logout(){
    sessionStorage.removeItem("token");
    Path.goTo('login');
  }

  function usersList(){
    $.ajax({
      url: API_URL + '/users',
      type: 'GET',
      dataType : "json",
    }).done(function( data, textStatus, jqXHR ) {
      var template = $('#userTempl').html();
      Mustache.parse(template);

      var htmlList = [];
      for(var i in data){
        htmlList.push(Mustache.render(template, data[i]));
      };
      $('.persons-list').html(htmlList.join(''));
    }).fail(function( jqXHR, textStatus, errorThrown ) {
      console.log(jqXHR);
    });
  }

  function user(id){
    $.ajax({
      url: 'http://api.sudodoki.name:8888/user/' + id,
      type: 'GET',
      dataType : "json",
      headers: {
        'SECRET-TOKEN': sessionStorage.getItem("token")
      }
    }).done(function( data, textStatus, jqXHR ) {
      console.log(data[0]);
      var template = $('#userDetailsTempl').html();
      Mustache.parse(template);
      $('.full-info').html(Mustache.render(template, data[0]));

    }).fail(function( jqXHR, textStatus, errorThrown ) {
      console.log(jqXHR);
    });
  }

  function showFormErrors(jqXHR, form) {
    if (jqXHR.responseJSON && jqXHR.responseJSON.errors) {

      for (var i in jqXHR.responseJSON.errors) {
        var error = jqXHR.responseJSON.errors[i];
        for (var j in error) {
          form.find('input[name='+ j +']').addClass('error').after('<small class="error">' + error[j] + '</small>');
        }
      }
    } else if (jqXHR.responseJSON && jqXHR.responseJSON.error) {
      form.find('input:first').addClass('error').after('<small class="error">' + jqXHR.responseJSON.error + '</small>');
    }
  }

  function cleanupError(form) {
    form.find('small.error').remove();
    form.find('input.error').removeClass('error');
  }

  function initUI() {
    if (!sessionStorage.getItem("token")) {
      Path.goTo('login');
    }
  }

  function isLoggedIn(){
    return (sessionStorage.getItem("token") && sessionStorage.getItem("token").length > 0);
  }


jQuery(function($){

  $(document).ajaxStart(function() {
    $(".loader").show();
  });

  $(document).ajaxStop(function() {
    $(".loader").hide();
  });


  $('#login_form').on('submit', function(e) {
    e.preventDefault();
    login();
  });
  $('#signup_form').on('submit', function(e) {
    e.preventDefault();
    signup();
  });

  $('.signup_link').on('click', function(e) {
    e.preventDefault();

    Path.goTo('signup');

  });

  $('.login_link').on('click', function(e) {
    e.preventDefault();
    Path.goTo('login');
  });

  $( ".logout_link" ).click(function(e) {
    e.preventDefault();
    logout();
  });

  $('.persons-list').on('click', 'li', function(e) {
    e.preventDefault();
    var userId = $(e.currentTarget).data('id');
    Path.goTo('user/' + userId);
  });


  function ui() {
    if (isLoggedIn()) {
      $(".user_menu, #list, #show-full").show();
      $("#login, #signup, .auth_link").hide();
    } else {
      $(".user_menu, #list, #show-full").hide();
      $("#login, #signup, .auth_link").show();
    }
  }


  Path.goTo = function(path) {
    window.location.hash = '#/' + path;
  };

  Path.map("#/login").to(function(){
    if (isLoggedIn()) {
      Path.goTo("users");
    } else {
      ui();
      $("#login").show();
      $("#signup").hide();
      $(".auth_link li").removeClass('active');
      $('.login_link').addClass("active");
    }
  });

  Path.map("#/signup").to(function(){
    if (isLoggedIn()) {
      Path.goTo("users");
    } else {
      ui();
      $("#login").hide();
      $("#signup").show();
      $(".auth_link li").removeClass('active');
      $('.signup_link').addClass("active");
    }
  });

  Path.map("#/user/:id").to(function(){
    if (0 === $('.persons-list').html().length) {
      ui();
      usersList();
    }
    if (isLoggedIn()) {
      user(this.params['id']);
    } else {
      Path.goTo("login");
    }

  });

  Path.map("#/users").to(function(){
    if (isLoggedIn()) {
      ui();
      usersList();
      $(".user_menu li").removeClass('active');
      $('.list_link').addClass("active");
    } else {
      Path.goTo("login");
    }
  });

  Path.rescue(function(){
    ui();
    Path.goTo("users");
  });

  Path.root("#/users");

  Path.listen();

  initUI();


});
