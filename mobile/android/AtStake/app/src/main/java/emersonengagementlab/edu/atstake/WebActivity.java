package emersonengagementlab.edu.atstake;

import android.app.Activity;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebView;

public class WebActivity extends Activity {

    String urlString = "http://127.0.0.1:3000/play/mobile";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_web);

        if(BuildConfig.ENVIRONMENT == "staging")
            urlString = "https://qa.atstakegame.com/play/mobile";
        if(BuildConfig.ENVIRONMENT == "production")
            urlString = "https://atstakegame.com/play/mobile";

        WebView gameWebView = (WebView) findViewById(R.id.webView);
        gameWebView.loadUrl(urlString);
    }
}
