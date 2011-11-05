function(doc) {
	if ((doc.type!==undefined) &&
        (doc.type=="tweet"))
    {
        var text = doc.text;
        var screen_name = doc.from_user;
        var created_at = doc.created_at;
        var geo = doc.geo;
        var lat = null
        var lon = null;
        if ((geo !== undefined)&&
            (geo != null) &&
            (geo.type == "Point"))
        {
            lat = geo.coordinates[0];
            lon = geo.coordinates[1];
        }

        var profile_image_url = doc.profile_image_url;
		emit([created_at, screen_name, profile_image_url, lat, lon, text], 1);
	}
}