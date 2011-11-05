
$(function() {

    // an individual tweet
    window.Tweet = Backbone.Model.extend({
        defaults: {
                      timestamp: false,
                      message: '',
                      user: ''
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
            $('#mydiv').html('');
            window.Tweets.map(function(tweet) {
                var view = new TweetView({model: tweet});
                this.$('#mydiv').append(view.render().el);
            });
            return this;
        },
        
    });

    window.AppView = new AppView;
    $.get('https://cloudant.com/db/occutweet/test/_design/app/_view/tweetfall', {limit:10,descending:'true'}, function(data) {
        var rows = data.rows;
        $.each(rows, function(index, item) {
            var itemDate = item['key'][0];
            var itemUser = item['key'][1];
            var itemImageURL = item['key'][2];
            var itemLat = item['key'][3];
            var itemLon = item['key'][4];
            var itemMessage = item['key'][5];
            var myTweet = new window.Tweet({timestamp: itemDate, message: itemMessage, user: itemUser});
            window.Tweets.add(myTweet);
        });
    }, 'jsonp');
});

