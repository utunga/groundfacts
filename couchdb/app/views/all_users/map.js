function(doc) {
	if ((doc.type!==undefined) &&
        (doc.type=="twitter_user"))
    {
		emit([doc.id], doc);
	}
}
