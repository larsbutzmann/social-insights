var socialInsights = {
  fbConnect: false,
  fbTwitter: false,
  fbLinkedin: false
};

window.fbAsyncInit = function() {
  FB.init({
    appId      : '1414238205493183',
    status     : true, // check login status
    cookie     : true, // enable cookies to allow the server to access the session
    xfbml      : true // parse XFBML
  });
  FB.Event.subscribe('auth.authResponseChange', function(response) {
    if (response.status === 'connected') {
      socialInsights.fbConnect = true;
      $("#facebook-logout").show();
      testAPI();
    } else if (response.status === 'not_authorized') {
      // request required permissions
      console.log("login");
      FB.login(function(){}, {scope: 'user_friends, friends_birthday, friends_location, user_activities, user_checkins, user_status, friends_relationships'});
    } else {
      // do something else
    }
  });
};

(function(d, s, id){
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {return;}
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/all.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function testAPI() {
  console.log('Welcome!  Fetching your information.... ');
  FB.api('/me', function(response) {
    console.log('Good to see you, ' + response.name + '.');
  });
}

(function(){
  $(document).foundation();

  // $("#facebook-logout").click(function(){
  //   FB.logout(function(response) {
  //     console.log("logged out");
  //     socialInsights.fbConnect = false;
  //     $("#facebook-logout").hide();
  //   });
  // });

  $("#facebook-logout").click(function(){
    FB.api('/me/permissions', "DELETE", function(response) {
      console.log(response);
    });
  });

  $("#getUserInfo").click(function(){
    function print(data) {
      console.log(data);
    }

    getPaginatedData("/me/friends?fields=birthday,relationship_status,location", print);

  });

  $(document).foundation({
    tab: {
      callback : function (tab) {
        var name = tab.context.hash.split("#")[1];
        console.log(name);
        switch (name) {
          case "locationChartTab":
            plotLocationChart();
            break;
          case "ageChartTab":
            plotAgeChart();
            break;
          case "relationshipChartTab":
            plotRelationshipChart();
            break;
        }
      }
    }
  });

  function plotAgeChart(){
    var ctx = document.getElementById("ageChart").getContext("2d");

    function plot(response) {
      var birthdays = {},
          labels = [],
          d = [];

      for (var i=0; i < response.length; i++) {
        var person = response[i];
        if (person.hasOwnProperty('birthday')) {
          var age = calculateAge(new Date(person.birthday));
          if (age > 13) {
            birthdays[age] = birthdays[age] + 1 || 1;
          }
        }
      }

      for (var a in birthdays) {
        labels.push(String(a));
        d.push(birthdays[a]);
      }

      var data = {
        labels : labels,
        datasets : [
          {
            fillColor : "rgba(220,220,220,0.5)",
            strokeColor : "rgba(220,220,220,1)",
            pointColor : "rgba(220,220,220,1)",
            pointStrokeColor : "#fff",
            data : d
          }
        ]
      };

      var options = {
        scaleShowGridLines: false,
        scaleOverride: true,
        scaleStepWidth: 5,
        scaleSteps: 10,
        scaleSartValue: 0
      };

      var myNewChart = new Chart(ctx).Line(data, options);

      function calculateAge(birthday) { // birthday is a date
        var ageDifMs = Date.now() - birthday.getTime();
        var ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(ageDate.getFullYear() - 1970);
      }
    }

    getPaginatedData("/me/friends?fields=birthday", plot);
  }

  function plotLocationChart(){
    var ctx = document.getElementById("locationChart").getContext("2d");

    function plot(response) {
      var locations = {},
          labels = [],
          d = [];

      for (var i=0; i < response.length; i++) {
        var person = response[i];
        if (person.hasOwnProperty('location')) {
          var city = person.location.name;
          locations[city] = locations[city] + 1 || 1;
        }
      }

      for (var a in locations) {
        if (locations[a] > 1) {
          labels.push(String(a));
          d.push(locations[a]);
        }
      }

      var data = {
        labels : labels,
        datasets : [
          {
            fillColor : "rgba(220,220,220,0.5)",
            strokeColor : "rgba(220,220,220,1)",
            pointColor : "rgba(220,220,220,1)",
            pointStrokeColor : "#fff",
            data : d
          }
        ]
      };

      var options = {
        scaleShowGridLines: false
      };

      var myNewChart = new Chart(ctx).Bar(data, options);
    }

    getPaginatedData("/me/friends?fields=location", plot);
  }

  function plotRelationshipChart(){
    var ctx = document.getElementById("relationshipChart").getContext("2d");

    function plot(response) {
      var relationships = {},
          labels = [];

      for (var i=0; i < response.length; i++) {
        var person = response[i];
        if (person.hasOwnProperty('relationship_status')) {
          var relationship_status = person.relationship_status;
          relationships[relationship_status] = relationships[relationship_status] + 1 || 1;
        } else {
          relationships["Unknown"] = relationships["Unknown"] + 1 || 1;
        }
      }

      console.log(relationships);

      var data = [];
      var color = ["#F7464A", "#E2EAE9", "#D4CCC5", "#949FB1", "#4D5360", "#F38630", "#E0E4CC", "#69D2E7"];

      $("#legend").empty();
      var j = 0;
      for (var a in relationships) {
        labels.push(a);
        data.push({
          value: relationships[a],
          color: color[j]
        });
        $("#legend").append("<div class='legend' style='background-color:" + color[j] + "'>" + a + "<div>");
        j += 1;
      }

      var myNewChart = new Chart(ctx).Pie(data);
    }

    getPaginatedData("/me/friends?fields=relationship_status", plot);
  }

  function getPaginatedData(url, cb) {
    var data = [];

    FB.api(url, getData);

    function getData(response) {
      data = data.concat(response.data);

      if (response.paging && response.paging.next) {
        url = response.paging.next.split(".com/")[1];
        FB.api(url, getData);
      } else {
        cb(data);
        console.log("loading done");
      }
    }
  }

})();
