//Google Analytics tracking code
TrackingCode = 'UA-XXXXXXXX-X'
//

if (TrackingCode != 'UA-XXXXXXXX-X'){
        var _gaq = _gaq || [];
        _gaq.push(['_setAccount', TrackingCode]);
        _gaq.push(['_trackPageview']);
        (function() {
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
        })();
}
