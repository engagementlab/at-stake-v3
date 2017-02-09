package emersonengagementlab.edu.atstake;

import android.app.Activity;
import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.webkit.WebView;

public class WebActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_web);

        WebView gameWebView = (WebView) findViewById(R.id.webView);
        gameWebView.loadUrl("https://qa.atstakegame.com/play/");
    }
}
