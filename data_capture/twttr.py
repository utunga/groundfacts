import urlparse
import urllib2
import logging
import json

import couchdb
from celery.task import task
import twitter #https://github.com/sixohsix/twitter

logging.basicConfig(format="%(asctime) %(message)")
logging.info('Logging on')

COUCH_KEY = 'psezediantitsedishortant'
COUCH_PW = 'GDRhxiMN0BQqeuCFQHM0qDUo'
COUCH_URI = 'https://%s:%s@occutweet.cloudant.com/' % (COUCH_KEY, COUCH_PW)

KLOUT_KEY = '3qxg77d4g4jjxcqrtsqunwj6'

token = ''
token_key = ''
con_secret = ''
con_secret_key = ''

server = couchdb.Server(url=COUCH_URI)
db = server['test']

#T =Twitter(auth=OAuth(token, token_key, con_secret, con_secret_key)))
T = twitter.Twitter(domain='search.twitter.com')

@task
def tweets(first_load=False, **params):
    params['with_twitter_user_id'] = True
    params['rpp'] = 100
    params['include_entities'] = True
    print first_load, params
    tt = T.search(**params)
    for tweet in tt['results']:
        logging.info('PROCESSING ' + tweet['text'])
        yield tweet
    if 'next_page' in tt:
        params = dict(urlparse.parse_qsl(tt['next_page'][1:]))
        if not first_load:
            params['since_id'] = tt['max_id']
        del params['max_id']
        for tweet in tweets(first_load=first_load, **params):
            yield tweet


def do_klout_score(screen_name):
    url = 'http://api.klout.com/1/klout.json?key=%s&users=%s'
    res = urllib2.urlopen(url % (KLOUT_KEY, screen_name))
    return json.load(res)['users'][0]['kscore']

def process_user(user):
    """
    Takes a user as a dict of data, stores it in the 
    db and does things like get the Klout score, etc.
    """
    user = dict(screen_name=user)
    user_from_db = {} #get_user(user)
    if not user_from_db:
        user_from_db_ = {}
    if not 'klout' in user_from_db:
        user['klout'] = do_klout_score(user['screen_name'])
        user['klout_updated_at'] = str(datetime.datetime.utcnow()) 
    store_user(user)


def get_user_from_screen_name(screen_name):
    ''

def store_data(type_, data):
    data['type'] = type_
    db.save(data)

def store_tweet(tweet):
    try:
        store_data('tweet', tweet)
    except couchdb.http.ResourceConflict as e:
        logging.warn(e.msg)

def store_user(user):
    print 'USER ', user
    store_data('twitter_user', user)

def _is_user_in_db(screen_name):
    raise Exception('dont use yet')
    m = """\
function(doc) {
  if (doc.type === 'twitter_user') {
    emit(doc.screen_name, null);
  }
}
"""
    r = """\
function(key, values) {
  if (key === %s) {
    return { key: true};
  } else {
    return { key: false}; 
  }
}
    """ % screen_name

    return any(v for k,v in db.query(map_fun=m, reduce_fun=r))

def is_user_in_db(screen_name):
    return False

def process_tweet(tweet):
    # logging.info('TWEET %s' % tweet['text'])
    print 'TWEET %s' % tweet['text']
    store_tweet(tweet)

def main(params):
    for tweet in tweets(**params):
        process_tweet(tweet)
        process_user(tweet['from_user_id'])


@task
def go(search_string):
    for tweet in tweets.delay(first_load=True, q=q):
        print tweet


if __name__ == "__main__":
    import sys
    import pprint
    from optparse import OptionParser

    parser = OptionParser()
    parser.add_option('-f', '--first-load', dest='first_load', default=True)
    parser.add_option('-q', '--query', dest='q')
    params = vars(parser.parse_args()[0])
    main(params)

    
