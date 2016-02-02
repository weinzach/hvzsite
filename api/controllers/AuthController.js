var passport = require('passport');

module.exports = {
    apiKey: function (req, res) {
        var user = req.user;
        if (!user) {
            return res.unauthorized("You are not logged in!");
        }
        else if (!user.active) {
            return res.forbidden("Your account must be activated by a moderator.");
        }
        else {
            return res.ok({key: user.apiKey});
        }
    },

    // Passport Methods
    loginGoogle: passport.authenticate('google', {scope: ['profile', 'email']}),
    callbackGoogle: function (req, res) {
        passport.authenticate('google', {failureRedirect: '/error'}, function (err, user) {
            if (err || !user) {
                return res.badRequest(err);
            }

            req.logIn(user, function (err) {
                if (err) {
                    return res.badRequest(err);
                }

                res.redirect('/ok');
            });
        })(req, res);
    }
}