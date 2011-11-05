
var loadBackbone = function() {

    // an individual tweet
    window.Tweet = Backbone.Model.extend({
        defaults: {
                      timestamp: false,
                      user: '',
                      profile_url: '',
                      lat: '',
                      lon: '',
                      message: '',
                  }
    });

    // a set of tweets
    window.Tweetset = Backbone.Collection.extend({
        model: Tweet,
        initialize: function() {
            //console.log('starting collection');
        }
    });
 
    // global collection of tweets
    window.Tweets = new Tweetset;

    window.TweetView = Backbone.View.extend({
        tagName: "div",
        template: _.template($('#tweet-template').html()),

        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        },
    });

    window.AppView = Backbone.View.extend({
        el: $('#myouterdiv'),

        template: _.template($('#tweet-template').html()),

        initialize: function() {
            this.render();
            window.Tweets.bind('add', function(item) {
                window.AppView.render();
            });
        },

        /*
        events: {
            'click input.add': 'addOne'
        },
        */

        addOne: function() {
            // test tweet
            var newTweet = new window.Tweet({timestamp: 9999, message: 'new tweet', user: 'new user'});
            window.Tweets.add(newTweet);
        },

        render: function() {
            // re-render the tweets (this redisplays them all
            // any time *one* changes - not ideal)
            $('#mydiv').html('');
            window.Tweets.map(function(tweet) {
                var view = new TweetView({model: tweet});
                this.$('#mydiv').append(view.render().el);
            });
            return this;
        },
        
    });

    window.AppView = new AppView;
    $.get('https://cloudant.com/db/occutweet/test/_design/app/_view/tweetfall', {limit:50,descending:'true'}, function(data) {
        var rows = data.rows;
        $.each(rows, function(index, item) {
            var itemDate = item['key'][0];
            var itemUser = item['key'][1];
            var itemProfileURL = item['key'][2];
            var itemLat = item['key'][3];
            var itemLon = item['key'][4];
            var itemMessage = item['key'][5];
            var myTweet = new window.Tweet({
                timestamp: itemDate,
                user: itemUser,
                profile_url: itemProfileURL,
                lat: itemLat,
                lon: itemLon,
                message: TwitterText.auto_link(itemMessage)
            });
            window.Tweets.add(myTweet);

            if (itemLat !== null && itemLon !== null) {
                // add point to the map
                var myLatlng = new google.maps.LatLng(itemLat,itemLon);
                var marker = new google.maps.Marker({
                    position: myLatlng, 
                    map: map,
                    title: itemMessage
                }); 
            }
            
        });
    }, 'jsonp');
};

