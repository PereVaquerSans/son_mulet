// Home Controller — renders the main landing page

exports.getHome = (req, res) => {
    res.render('index', {
        currentPage: 'home'
    });
};
