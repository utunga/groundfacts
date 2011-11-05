
$(function() {

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
    window.FilteredTweets = new Tweetset;

    window.TweetView = Backbone.View.extend({
        tagName: "div",
        template: _.template($('#tweet-template').html()),

        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        },
    });

    window.AppView = Backbone.View.extend({
        el: $('#appdiv'),

        template: _.template($('#tweet-template').html()),

        initialize: function() {
            this.renderAll();
            this.renderFiltered();
            /*
            window.Tweets.bind('add', function(item) {
                window.AppView.renderAll();
            });
            window.FilteredTweets.bind('add', function(item) {
                window.AppView.renderFiltered();
            });
            */
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
        json2model: function(item) {
            var itemDate = item['value']['created_at'];
            var itemUser = item['value']['screen_name'];
            var itemProfileURL = item['value']['profile_image_url'];
            var itemLat = item['value']['lat'];
            var itemLon = item['value']['lon'];
            var itemMessage = item['value']['text'];
            var myTweet = new window.Tweet({
                timestamp: itemDate,
                user: itemUser,
                profile_url: itemProfileURL,
                lat: itemLat,
                lon: itemLon,
                message: TwitterText.auto_link(itemMessage)
            });
            return myTweet;
        },
        addAll: function(data) {
            var rows = data.rows;
            window.Tweets.reset();
            $.each(rows, function(index, item) {
                var myTweet = window.AppView.json2model(item);
                window.Tweets.add(myTweet);
                
            });
            window.AppView.renderAll();
        },
        addFiltered: function(data) {
            var rows = data.rows;
            window.FilteredTweets.reset();
            $.each(rows, function(index, item) {
                var myTweet = window.AppView.json2model(item);
                window.FilteredTweets.add(myTweet);
                
            });
            window.AppView.renderFiltered();
        },

        renderAll: function() {
            // re-render the tweets (this redisplays them all
            // any time *one* changes - not ideal)
            $('#alldiv').html('');
            window.Tweets.map(function(tweet) {
                var view = new TweetView({model: tweet});
                this.$('#alldiv').append(view.render().el);
            });
            return this;
        },

        renderFiltered: function() {
            $('#filtereddiv').html('');
            window.FilteredTweets.map(function(tweet) {
                var view = new TweetView({model: tweet});
                this.$('#filtereddiv').append(view.render().el);
            });
            return this;
        },
        
    });

    // get all data
    window.AppView = new AppView;

    $.get('https://cloudant.com/db/occutweet/occ/_design/app/_view/tweetfall', {limit:50,descending:'true',reduce:'false'}, function(data) {
        window.AppView.addAll(data);
    }, 'jsonp');

    // get filtered data
    $.get('https://cloudant.com/db/occutweet/occ/_design/app/_view/tweetfall', {limit:50,descending:'true',reduce:'false'}, function(data) {
        window.AppView.addFiltered(data);
    }, 'jsonp');
});

