module.exports = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    if (req.query.apikey == undefined) {
        return res.unauthorized("No authentication");
    }

    AuthService.getUser(req.query.apikey)
        .then(function (user) {
            if (user) {
                req.logIn(user, function (err) {
                    if (err) {
                        return res.badRequest(err);
                    }

                    return next();
                });
            }
            else
                return res.unauthorized("Invalid API key");
        }, function (err) {
            return res.unauthorized(err);
        });
}