
$(function() {

    // an individual tweet
    window.Tweet = Backbone.Model.extend({
        defaults: {
                      timestamp: false,
                      message: ''
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

    // manually add to the collection
    window.Tweets.add({timestamp: 1234, message: 'this is a tweet'});
    // another way
    var myTweet = new window.Tweet({timestamp: 2345, message: 'another tweet'}) // new tweet using defaults
    window.Tweets.add(myTweet);

    window.TweetView = Backbone.View.extend({
        tagName: "div",
        template: _.template($('#tweet-template').html()),

        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        },
    });

    window.AppView = Backbone.View.extend({
        el: $('#mydiv'),

        template: _.template($('#tweet-template').html()),

        initialize: function() {
            //window.Tweets.fetch();
            this.render();
        },

        render: function() {
            window.Tweets.map(function(tweet) {
                var view = new TweetView({model: tweet});
                this.$('#mydiv').append(view.render().el);
            });
            return this;
        },
        
    });

    window.AppView = new AppView;
});
